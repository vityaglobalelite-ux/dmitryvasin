#!/usr/bin/env bash
set -euo pipefail

# Deploy webhook fix + bot UI fix, then re-mark paid sessions from Stripe

cp -f /tmp/stripe-webhook-index.ts \
  /root/supabase/docker/volumes/functions/stripe-webhook/index.ts
cp -f /tmp/bot-index.js /root/telegram-bot/src/index.js

cd /root/supabase/docker
docker compose up -d --force-recreate functions

cd /root/telegram-bot
docker compose up -d --build --force-recreate

sleep 3

# For pending payments: ask Stripe if session is paid, mark paid in DB
SK=$(grep '^STRIPE_SECRET_KEY=' /root/supabase/docker/.env | cut -d= -f2-)

docker exec -i supabase-db psql -U supabase_admin -d postgres -tAc \
  "select id || '|' || coalesce(stripe_checkout_session_id,'') from payments where status='pending';" \
  | while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      pid="${line%%|*}"
      sid="${line#*|}"
      [[ -z "$sid" ]] && continue
      echo "Checking $pid $sid"
      curl -sS "https://api.stripe.com/v1/checkout/sessions/${sid}" \
        -u "${SK}:" -o "/tmp/sess_${sid}.json"
      status=$(python3 -c "import json;d=json.load(open('/tmp/sess_${sid}.json'));print(d.get('payment_status',''), d.get('status',''), d.get('payment_intent') or '')")
      echo "  stripe: $status"
      pay_status=$(echo "$status" | awk '{print $1}')
      pi=$(echo "$status" | awk '{print $3}')
      if [[ "$pay_status" == "paid" ]]; then
        docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
          "update payments set status='paid', stripe_payment_intent_id=nullif('${pi}',''), updated_at=now(), error=null where id='${pid}' and status='pending';"
        echo "  marked paid"
      fi
    done

sleep 12
docker exec -i supabase-db psql -U supabase_admin -d postgres -c \
  "select id, tariff, status, granted_at from payments order by created_at desc limit 5;"
docker logs telegram-bot --tail 25 2>&1
docker logs supabase-edge-functions --tail 20 2>&1
echo DONE
