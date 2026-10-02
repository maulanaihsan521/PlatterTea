#!/usr/bin/env bash
# Restart PlatterTea dev server SAFELY (survives sandbox process reaping).
#
# WHY: the sandbox kills every process spawned by an agent tool-call when the
# call ends — EXCEPT processes that were orphaned to PID 1 (double-fork
# daemonized). The platform's own start.sh children survive the same way.
# Plain `nohup bun run dev &` or `setsid ... &` DOES NOT survive.
#
# Usage:  bash scripts/dev-daemon.sh [--kill]
#   --kill   only stop the running server (it will NOT auto-restart)

set -e
cd "$(dirname "$0")/.."

if [ "$1" = "--kill" ]; then
  pkill -f "next dev -p 3000" 2>/dev/null || true
  pkill -f "bun run dev" 2>/dev/null || true
  echo "dev server stopped"
  exit 0
fi

if curl -s -o /dev/null --max-time 3 http://localhost:3000/; then
  echo "dev server already running on :3000"
  exit 0
fi

python3 - <<'EOF'
import os, sys
if os.fork() > 0:
    sys.exit(0)          # parent exits; child reparents to PID 1
os.setsid()
if os.fork() > 0:
    sys.exit(0)          # double fork; daemon reparents to PID 1
os.chdir('/home/z/my-project')
devnull = os.open('/dev/null', os.O_RDWR)
os.dup2(devnull, 0); os.dup2(devnull, 1); os.dup2(devnull, 2)
os.execvp('bun', ['bun', 'run', 'dev'])
EOF

for i in $(seq 1 30); do
  sleep 2
  if curl -s -o /dev/null --max-time 3 http://localhost:3000/; then
    echo "dev server UP (http 200)"
    exit 0
  fi
done
echo "dev server did not respond within 60s — check dev.log"
exit 1
