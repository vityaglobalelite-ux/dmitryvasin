#!/usr/bin/env bash
set -euo pipefail

SRC=/tmp/bot-multi-month
mkdir -p "$SRC"

cp -f "$SRC"/*.js /root/telegram-bot/src/ 2>/dev/null || true
# explicit copy from uploaded paths
for f in access.js channels.js config.js db.js index.js keyboards.js membership.js payments.js texts.js; do
  if [[ -f "/tmp/bot-multi-month/$f" ]]; then
    cp -f "/tmp/bot-multi-month/$f" "/root/telegram-bot/src/$f"
  fi
done

if [[ -f /tmp/008_multi_month_channels.sql ]]; then
  docker exec -i supabase-db psql -U supabase_admin -d postgres < /tmp/008_multi_month_channels.sql
fi

ENV=/root/telegram-bot/.env
sed -i '/^TELEGRAM_CHANNEL_MONTH1=/d' "$ENV"
sed -i '/^TELEGRAM_CHANNEL_MONTH2=/d' "$ENV"
sed -i '/^TELEGRAM_CHANNEL_MONTH3=/d' "$ENV"
sed -i '/^TELEGRAM_CHANNEL_ID=/d' "$ENV"
cat >> "$ENV" <<'EOF'
TELEGRAM_CHANNEL_MONTH1=-1004367055726
TELEGRAM_CHANNEL_MONTH2=-1004458745262
TELEGRAM_CHANNEL_MONTH3=-1004488301278
TELEGRAM_CHANNEL_ID=-1004367055726
EOF

cd /root/telegram-bot
docker compose up -d --build --force-recreate
sleep 3
docker logs telegram-bot --tail 20 2>&1
echo DONE
