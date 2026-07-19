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
