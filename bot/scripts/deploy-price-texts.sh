#!/usr/bin/env bash
set -euo pipefail

SRC=/tmp/bot-price-src
mkdir -p "$SRC"
# files already uploaded beside this script expectations:
# we copy from /tmp/bot-update if present

UPD=/tmp/bot-update
cp -f "$UPD"/price-labels.js "$UPD"/texts.js "$UPD"/db.js "$UPD"/index.js \
  "$UPD"/scheduler.js "$UPD"/membership.js "$UPD"/payments.js \
  /root/telegram-bot/src/

docker exec -i supabase-db psql -U supabase_admin -d postgres < /tmp/007_tariff_price_was.sql

cd /root/telegram-bot
docker compose up -d --build --force-recreate
sleep 2
docker logs telegram-bot --tail 15 2>&1
echo DONE
