#!/bin/sh
set -e
echo "container status:"
docker inspect -f '{{.State.Status}}' telegram-bot
echo "env:"
docker exec telegram-bot printenv SUPABASE_URL
docker exec telegram-bot printenv PAYMENT_MODE
echo "supabase:"
docker exec telegram-bot node - <<'NODE'
const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});
s.from("bot_users")
  .select("telegram_id")
  .limit(1)
  .then((r) => {
    console.log(JSON.stringify(r));
    process.exit(r.error ? 1 : 0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
NODE
echo "webhook:"
TOKEN=$(grep TELEGRAM_BOT_TOKEN /root/telegram-bot/.env | cut -d= -f2-)
curl -sS --max-time 10 "https://api.telegram.org/bot${TOKEN}/getWebhookInfo"
echo
echo "logs:"
docker logs telegram-bot --tail 30 2>&1 || true
