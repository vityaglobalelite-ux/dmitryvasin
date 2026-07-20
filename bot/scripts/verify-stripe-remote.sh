#!/usr/bin/env bash
set -euo pipefail

docker exec -i supabase-db psql -U supabase_admin -d postgres < /tmp/006_fix_grants.sql

echo "== functions env =="
docker exec supabase-edge-functions printenv | grep -E '^(STRIPE_|CHECKOUT_)' | sed 's/=.*/=***/'

echo "== bot env =="
grep -E '^(PAYMENT_MODE|TELEGRAM_BOT_USERNAME|CHECKOUT_SECRET)=' /root/telegram-bot/.env | sed 's/CHECKOUT_SECRET=.*/CHECKOUT_SECRET=***/'

echo "== create-checkout without secret (expect 401) =="
curl -sS -w "\nHTTP:%{http_code}\n" -X POST \
  "https://api.betango.dance/functions/v1/create-checkout" \
  -H "Content-Type: application/json" \
  -d '{"telegram_id":1,"tariff":"trial"}'

echo "== bot logs =="
docker logs telegram-bot --tail 20 2>&1

echo "== function folders =="
ls -la /root/supabase/docker/volumes/functions/
