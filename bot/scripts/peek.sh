#!/bin/sh
set -e
echo "=== bot.log ==="
docker exec telegram-bot cat /tmp/bot.log 2>/dev/null || echo "(no log)"
echo "=== settings ==="
docker exec supabase-db psql -U postgres -d postgres -c "select * from bot_settings;"
echo "=== container ==="
docker inspect -f 'running={{.State.Running}} restarts={{.RestartCount}}' telegram-bot
echo "=== recent channel bind attempts via getChat if known ==="
# Ask bot process to dump nothing; use telegram getMe
TOKEN=$(grep TELEGRAM_BOT_TOKEN /root/telegram-bot/.env | cut -d= -f2-)
curl -sS --max-time 10 "https://api.telegram.org/bot${TOKEN}/getMe"
echo
