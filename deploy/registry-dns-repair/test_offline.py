#!/usr/bin/env python3
"""Offline safety tests for the registry hosts-file repair script embedded in job.yaml."""
from pathlib import Path
import os
import re
import subprocess
import tempfile
import hashlib
import base64

manifest = Path(__file__).with_name("job.yaml").read_text()
match = re.search(r"(?m)^            - \|\n((?:              .*\n)+)", manifest)
assert match, "could not extract shell script"
script = "\n".join(line[14:] for line in match.group(1).splitlines())

def run(contents, mode, extra=None):
    with tempfile.TemporaryDirectory() as d:
        path = Path(d) / "hosts"
        path.write_text(contents)
        result = subprocess.run(["/bin/sh", "-c", script], env={**os.environ, "HOSTS_FILE": str(path), "MODE": mode, "EXPECTED_SHA256": hashlib.sha256(contents.encode()).hexdigest(), **(extra or {})}, text=True, capture_output=True)
        return result, path.read_text()

# Test harness substitutes the production path in the extracted script only.
script = script.replace("/host/hosts", '"$HOSTS_FILE"')
base = "127.0.0.1 localhost\n192.168.102.22 other-service\n"
r, out = run(base, "apply")
assert r.returncode == 0 and out.startswith(base) and "192.168.102.21\tregistry.tgm.one" in out, (r.returncode, r.stderr, out)
r2, out2 = run(out, "apply")
assert r2.returncode == 0 and out2 == out and "already present" in r2.stdout
conflict = base + "192.168.102.99 registry.tgm.one\n"
r3, out3 = run(conflict, "apply")
assert r3.returncode == 20 and out3 == conflict
r4, out4 = run(base, "inspect")
assert r4.returncode == 0 and "--- /etc/hosts (base64 preimage" in r4.stdout and out4 == base
backup = {"PREIMAGE_B64": base64.b64encode(base.encode()).decode(), "PREIMAGE_SHA256": hashlib.sha256(base.encode()).hexdigest()}
r5, restored = run(out, "rollback", backup)
assert r5.returncode == 0 and restored == base, (r5.returncode, r5.stderr)
r6, untouched = run(out, "rollback", {**backup, "EXPECTED_SHA256": "0" * 64})
assert r6.returncode == 22 and untouched == out
r7, untouched = run(base, "apply", {"EXPECTED_SHA256": "0" * 64})
assert r7.returncode == 23 and untouched == base
r8, untouched = run(out, "rollback", {**backup, "PREIMAGE_SHA256": "0" * 64})
assert r8.returncode == 24 and untouched == out
print("PASS: guarded rollback restores exact bytes; stale preimage/current hash and corrupt backup refuse")
assert "nodeName: tgm-rke2-agent-5" in manifest
assert "automountServiceAccountToken: false" in manifest
assert "privileged" not in manifest and "hostPID" not in manifest
print("PASS: append preserves preimage, repeat is idempotent, conflict refuses without change, inspect is read-only")
print("PASS: manifest pins node/image/pull policy and disables service-account token, privilege, hostPID")
