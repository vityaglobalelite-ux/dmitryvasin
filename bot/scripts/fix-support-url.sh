#!/bin/sh
set -e
ENV=/root/telegram-bot/.env
URL='https://t.me/be_tango_support_bot?start=help'
if grep -q '^SUPPORT_URL=' "$ENV"; then
  sed -i "s|^SUPPORT_URL=.*|SUPPORT_URL=${URL}|" "$ENV"
else
  echo "SUPPORT_URL=${URL}" >> "$ENV"
fi
grep '^SUPPORT_URL=' "$ENV"
cd /root/telegram-bot && docker compose up -d
sleep 2
docker exec telegram-bot printenv SUPPORT_URL
