"""Scoped approved staging registry DNS repair. Saves guarded rollback Jobs, never deletes resources."""
import base64
import copy
import datetime
import hashlib
import json
import re
import subprocess
from pathlib import Path
import yaml

ROOT = Path(__file__).parent
BASE = yaml.safe_load((ROOT / 'job.yaml').read_text())
assert BASE['spec']['template']['spec']['nodeName'] == 'tgm-rke2-agent-5'
STAMP = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S')
OUT = Path('/home/tgm/nextcloud/Projects/TGM-One/registry-dns-repair') / STAMP
OUT.mkdir(parents=True)


def call(args, payload=None):
    return subprocess.check_output(['kubectl', *args], input=payload, stderr=subprocess.STDOUT).decode()


def document(kind, mode, extra=None):
    doc = copy.deepcopy(BASE)
    doc['metadata']['name'] = f'registry-dns-{kind}-{mode}-{STAMP}'
    spec = doc['spec']['template']['spec']
    spec['volumes'][0]['hostPath']['path'] = {'hosts': '/etc/hosts', 'template': '/etc/cloud/templates/hosts.debian.tmpl'}[kind]
    spec['containers'][0]['env'] = [{'name': 'MODE', 'value': mode}, *({'name': k, 'value': v} for k, v in (extra or {}).items())]
    return doc


def run(doc):
    name = doc['metadata']['name']
    print(call(['create', '--dry-run=server', '-f', '-'], json.dumps(doc).encode()).strip(), flush=True)
    print(call(['create', '-f', '-'], json.dumps(doc).encode()).strip(), flush=True)
    try:
        print(call(['wait', '-n', 'kube-system', '--for=condition=complete', 'job/' + name, '--timeout=60s']).strip(), flush=True)
    except subprocess.CalledProcessError:
        print(call(['logs', '-n', 'kube-system', 'job/' + name]), flush=True)
        raise
    logs = call(['logs', '-n', 'kube-system', 'job/' + name])
    (OUT / (name + '.log')).write_text(logs)
    print(logs.strip(), flush=True)
    return logs


def inspect(kind, suffix='inspect'):
    doc = document(kind, 'inspect')
    doc['metadata']['name'] = doc['metadata']['name'].replace('-inspect-', '-' + suffix + '-')
    logs = run(doc)
    encoded = logs.split('---\n', 1)[1].split('--- end preimage ---', 1)[0]
    data = base64.b64decode(encoded)
    sha = hashlib.sha256(data).hexdigest()
    assert re.search(r'^' + sha + r'\s+/host/hosts$', logs, re.M)
    return data, sha

# Inspect both files before touching either. Cloud-init is the actual durable hosts owner.
backups = {}
for kind in ('template', 'hosts'):
    data, sha = inspect(kind)
    (OUT / (kind + '.before')).write_bytes(data)
    backups[kind] = (data, sha)

for kind in ('template', 'hosts'):
    data, sha = backups[kind]
    line = b'\n192.168.102.21\tregistry.tgm.one\t# staging registry DNS repair\n'
    existing = any('registry.tgm.one' in x.split('#', 1)[0].split()[1:] for x in data.decode().splitlines() if x.split('#', 1)[0].split())
    expected = data if existing else data + line
    repaired_sha = hashlib.sha256(expected).hexdigest()
    rollback = document(kind, 'rollback', {'EXPECTED_SHA256': repaired_sha, 'PREIMAGE_B64': base64.b64encode(data).decode(), 'PREIMAGE_SHA256': sha})
    (OUT / (kind + '.rollback.json')).write_text(json.dumps(rollback, indent=2))
    run(document(kind, 'apply', {'EXPECTED_SHA256': sha}))
    actual, actual_sha = inspect(kind, 'readback')
    assert actual == expected and actual_sha == repaired_sha
    repeat = document(kind, 'apply', {'EXPECTED_SHA256': repaired_sha})
    repeat['metadata']['name'] = repeat['metadata']['name'].replace('-apply-', '-repeat-')
    assert 'already present; unchanged' in run(repeat)
    print(json.dumps({'target': kind, 'sha256': actual_sha, 'verified': True, 'idempotent': True}), flush=True)

(OUT / 'summary.json').write_text(json.dumps({'node': 'tgm-rke2-agent-5', 'mapping': '192.168.102.21 registry.tgm.one', 'verified': True, 'rollback_directory': str(OUT)}, indent=2))
print('Verified repair and rollback artifacts:', OUT, flush=True)
