# Scoped staging registry DNS repair

This recovery is intentionally limited to tgm-rke2-agent-5 and the single hostname registry.tgm.one. Do not apply to production nodes or generalize to other hosts without approval.

`run.py` renders and applies checksum-guarded Kubernetes Jobs using the observed cached Calico image. It first backs up both `/etc/hosts` and cloud-init's owning `/etc/cloud/templates/hosts.debian.tmpl`, then adds the single internal registry mapping, reads both targets back byte-for-byte, and repeats the apply to prove idempotence. Cloud-init remains enabled and all unrelated file bytes remain intact. Jobs have no API token, no privilege escalation, no privileged mode, and only one exact host file mount per execution.

Validation: `python3 deploy/registry-dns-repair/test_offline.py`.
Approved repair: `python3 deploy/registry-dns-repair/run.py`.

Backups, logs, summaries and individually guarded rollback Job JSON are saved under `~/nextcloud/Projects/TGM-One/registry-dns-repair/<timestamp>/`. A rollback requires separately reviewing and applying the saved exact Job document with kubectl; it refuses if either the current repaired bytes or original backup checksum differs. Do not blindly run rollback documents after another operator modifies these files.

The verified staging rollout uses `deploy/staging-live-content-patch.json`, applied with strategic merge to `deployment/tgm-one-staging` in namespace `tgm-one-staging`. It pins the app to this repaired node and uses TCP health probes, avoiding an external content dependency for liveness/readiness. Preserve existing runtime configuration and the publishable analytics key when deploying a locally built image; do not commit credentials or create registry permission grants.

Do not apply the legacy `deploy/staging-onprem.json` wholesale: its public staging Ingress is retired. Current staging is `staging.i.tgm.one`.

This repair does not fix GitHub-hosted runners being denied by the registry's existing source allowlist, does not change cluster-wide DNS, and does not permit server-side Foligo egress in staging. The application recovers live content in the browser when SSR cannot reach Foligo.
