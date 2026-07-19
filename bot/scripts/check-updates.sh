#!/bin/sh
TOKEN=$(grep TELEGRAM_BOT_TOKEN /root/telegram-bot/.env | cut -d= -f2-)
docker exec supabase-db psql -U postgres -d postgres -c "select * from bot_settings;"
echo "--- updates ---"
curl -sS --max-time 15 "https://api.telegram.org/bot${TOKEN}/getUpdates?limit=30"
echo
echo "--- logs ---"
docker logs telegram-bot --tail 40 2>&1 || true
