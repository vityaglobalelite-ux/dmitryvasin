const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.argv[2] || "-1003939690495";

async function api(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

(async () => {
  const chat = await api("getChat", { chat_id: channelId });
  console.log("getChat:", JSON.stringify(chat));
  const link = await api("createChatInviteLink", {
    chat_id: channelId,
    member_limit: 1,
    name: "test-link",
  });
  console.log("invite:", JSON.stringify(link));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
