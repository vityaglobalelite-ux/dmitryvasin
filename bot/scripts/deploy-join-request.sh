#!/bin/sh
set -e
docker exec supabase-db psql -U postgres -d postgres -c "update subscriptions set invite_link = null, invite_created_at = null where status = 'active';"
cd /root/telegram-bot && docker compose up -d --build
sleep 2
docker exec telegram-bot tail -3 /tmp/bot.log
