#!/bin/sh
set -e
ENV=/root/telegram-bot/.env
URL='https://betango.dance/go-support.html'
if grep -q '^SUPPORT_WEBAPP_URL=' "$ENV"; then
  sed -i "s|^SUPPORT_WEBAPP_URL=.*|SUPPORT_WEBAPP_URL=${URL}|" "$ENV"
else
  echo "SUPPORT_WEBAPP_URL=${URL}" >> "$ENV"
fi
grep -E 'SUPPORT_' "$ENV"
cd /root/telegram-bot && docker compose up -d --build
sleep 2
docker exec telegram-bot printenv SUPPORT_WEBAPP_URL
docker exec telegram-bot tail -1 /tmp/bot.log
