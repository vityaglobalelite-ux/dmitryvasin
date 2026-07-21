#!/usr/bin/env bash
set -euo pipefail

echo "== tables =="
docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
  "select table_name from information_schema.tables where table_schema='public' order by 1;"

echo "== chats for user =="
docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
  "select * from chats where telegram_id=5347333358;"

echo "== recent messages =="
docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
  "select m.created_at, m.direction, left(coalesce(m.body, m.text, ''), 200) as body
   from messages m
   join chats c on c.id = m.chat_id
   where c.telegram_id = 5347333358
   order by m.created_at desc
   limit 50;" 2>&1 || true

echo "== bot_users =="
docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
  "select telegram_id, username, first_name, state, updated_at from bot_users where telegram_id=5347333358;"

echo "== support logs =="
docker logs telegram-support-bot --tail 40 2>&1 || true

echo "== main bot logs =="
docker logs telegram-bot --tail 40 2>&1 || true

# Try to dump columns of messages
echo "== messages columns =="
docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
  "\d messages" 2>&1 || true
