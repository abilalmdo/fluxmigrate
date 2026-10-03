#!/usr/bin/env bash
# Local preview WITH the contact form working: the built site (dist/) served by real PHP in Docker,
# and a fake SMTP server that keeps every enquiry instead of sending it. Nothing leaves this machine.
#
#   pnpm build
#   bash tools/form-test/preview.sh          # start (stays in the foreground: it keeps WSL awake)
#   bash tools/form-test/preview.sh stop     # stop and clean up
#
# On Windows, start it hidden so WSL is not shut down after ~60 s without a shell:
#   Start-Process -WindowStyle Hidden wsl.exe -ArgumentList @('-d','Ubuntu','-e','bash','/mnt/d/FluxMigrate/fluxmigrate/tools/form-test/preview.sh')
# Then open http://localhost:8088 (use "localhost": the form checks the Origin host).
# See what the form "sent":  node tools/form-test/show-mail.mjs
# The form allows 5 sends per IP per hour, as in production. To reset:
#   docker exec fm-preview sh -c 'rm -f /tmp/fm-form-*'
#
# The nginx preview (docker compose, also port 8088) does not run PHP, so its form answers 501: stop one
# before starting the other.
set -euo pipefail
cd "$(dirname "$0")/../.."

PORT=${PORT:-8088}
SITE=/tmp/fm-preview
SINK=/tmp/smtp-sink.jsonl

stop() {
  docker rm -f fm-preview >/dev/null 2>&1 || true
  pkill -f "form-test/smtp-sink.mjs" 2>/dev/null || true
  rm -rf "$SITE"
}

if [ "${1:-}" = "stop" ]; then
  stop
  pkill -f "sleep infinity" 2>/dev/null || true
  echo "preview stopped"
  exit 0
fi

[ -f dist/index.html ] || { echo "dist/ is empty: run pnpm build first" >&2; exit 1; }
stop
cp -r dist "$SITE"
DIST_DIR="$SITE" SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_SECURE=none SMTP_USER=forms@fluxmigrate.com \
  SMTP_PASSWORD=preview-only ALLOWED_HOSTS="localhost,127.0.0.1" DATA_DIR=/tmp/fm-data-preview SITE_URL="http://localhost:$PORT" node tools/write-mail-config.mjs

docker run -d --rm --name fm-preview --network host -v "$SITE":/site:ro php:8.3-cli \
  php -S "0.0.0.0:$PORT" -t /site >/dev/null
node tools/form-test/smtp-sink.mjs 2525 "$SINK" &
trap stop EXIT
echo "preview ready: http://localhost:$PORT  (form mail is kept in $SINK, not sent)"
sleep infinity
