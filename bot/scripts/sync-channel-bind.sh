#!/usr/bin/env bash
set -euo pipefail

echo "== bot_settings telegram_channel_id =="
docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
  "select key, value, updated_at from bot_settings where key='telegram_channel_id';"

DB_ID=$(docker exec -i supabase-db psql -U supabase_admin -d postgres -tAc \
  "select value from bot_settings where key='telegram_channel_id';" | tr -d '[:space:]')

echo "db=$DB_ID"
echo "env before:"
grep '^TELEGRAM_CHANNEL_ID=' /root/telegram-bot/.env || true

if [[ -n "$DB_ID" ]]; then
  sed -i '/^TELEGRAM_CHANNEL_ID=/d' /root/telegram-bot/.env
  echo "TELEGRAM_CHANNEL_ID=${DB_ID}" >> /root/telegram-bot/.env
  echo "Updated .env to TELEGRAM_CHANNEL_ID=${DB_ID}"
else
  echo "No bind in DB yet — leave env as is"
fi

echo "env after:"
grep '^TELEGRAM_CHANNEL_ID=' /root/telegram-bot/.env || true

cp -f /tmp/bot-index-clean.js /root/telegram-bot/src/index.js
cd /root/telegram-bot
docker compose up -d --build --force-recreate
sleep 2
docker logs telegram-bot --tail 8 2>&1
