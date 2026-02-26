const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export async function sendTelegramMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Telegram API error:", error);
    return false;
  }
  return true;
}

export async function setWebhook(url: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }
  );
  return response.json();
}
