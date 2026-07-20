#!/usr/bin/env bash
set -euo pipefail

echo "== payments =="
docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
  "select id, telegram_id, tariff, status, left(coalesce(stripe_checkout_session_id,''),20) as session, error, created_at, updated_at from payments order by created_at desc limit 8;"

echo "== edge logs =="
docker logs supabase-edge-functions --tail 60 2>&1

echo "== kong route test =="
curl -sS -o /tmp/wh_probe.json -w "HTTP:%{http_code}\n" -X POST \
  "https://api.betango.dance/functions/v1/stripe-webhook" \
  -H "Content-Type: application/json" \
  -d '{"probe":true}' || true
cat /tmp/wh_probe.json; echo

echo "== bot logs =="
docker logs telegram-bot --tail 30 2>&1
