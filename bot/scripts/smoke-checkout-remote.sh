#!/usr/bin/env bash
set -euo pipefail

SECRET=$(grep '^CHECKOUT_SECRET=' /root/telegram-bot/.env | cut -d= -f2-)
SRK=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' /root/telegram-bot/.env | cut -d= -f2-)

TG=$(docker exec -i supabase-db psql -U supabase_admin -d postgres -tAc \
  "select telegram_id from bot_users order by updated_at desc nulls last limit 1;")
TG=$(echo "$TG" | tr -d '[:space:]')
if [[ -z "$TG" ]]; then
  echo "No bot_users — skip authenticated checkout smoke"
  exit 0
fi

echo "Using telegram_id=$TG"
curl -sS -w "\nHTTP:%{http_code}\n" -X POST \
  "https://api.betango.dance/functions/v1/create-checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SRK}" \
  -H "apikey: ${SRK}" \
  -H "x-checkout-secret: ${SECRET}" \
  -d "{\"telegram_id\":${TG},\"tariff\":\"trial\",\"payment_method\":\"foreign\"}"
