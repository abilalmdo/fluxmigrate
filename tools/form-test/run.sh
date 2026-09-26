#!/usr/bin/env bash
# End-to-end test of the contact form back end: real PHP (docker php:8.3-cli), real PHPMailer, a fake
# SMTP server. Run from the repo root, after `pnpm build`, inside WSL on the Windows dev machine:
#   wsl -e bash -lc "cd /mnt/d/FluxMigrate/fluxmigrate && bash tools/form-test/run.sh"
# What it cannot cover: the production .htaccess (php -S does not read it) and the real mailbox.
# The deploy workflow checks the first after every deploy; a real enquiry checks the second.
set -euo pipefail
cd "$(dirname "$0")/../.."

SITE=/tmp/fm-site
SINK=/tmp/smtp-sink.jsonl
PORT=8089
BASE="http://127.0.0.1:$PORT"

rm -rf "$SITE" && cp -r dist "$SITE"
DIST_DIR="$SITE" SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_SECURE=none SMTP_USER=forms@fluxmigrate.com   SMTP_PASSWORD="p\"a'ss\$w\ord;<?php echo 1; ?>" ALLOWED_HOSTS="127.0.0.1,localhost"   node tools/write-mail-config.mjs

docker rm -f fm-php >/dev/null 2>&1 || true
docker run -d --rm --name fm-php --network host -v "$SITE":/site:ro php:8.3-cli php -S "127.0.0.1:$PORT" -t /site >/dev/null
node tools/form-test/smtp-sink.mjs 2525 "$SINK" &
SINK_PID=$!
trap 'kill $SINK_PID 2>/dev/null || true; docker rm -f fm-php >/dev/null 2>&1 || true' EXIT
sleep 2

status=0
node tools/form-test/check-endpoint.mjs "$BASE" "$SINK" main || status=1

# second phase: SMTP server gone, rate-limit window reset
kill $SINK_PID; wait $SINK_PID 2>/dev/null || true
docker exec fm-php sh -c 'rm -f /tmp/fm-form-*'
node tools/form-test/check-endpoint.mjs "$BASE" "$SINK" smtp-down || status=1

exit $status
