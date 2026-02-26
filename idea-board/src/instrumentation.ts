export async function onRequestError() {
  // required export, no-op
}

export async function register() {
  // Устанавливаем Telegram webhook при старте сервера
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (appUrl && botToken) {
      const webhookUrl = `${appUrl}/api/bot/webhook`;

      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/setWebhook`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: webhookUrl }),
          }
        );
        const result = await response.json();

        if (result.ok) {
          console.log(`[Telegram] Webhook установлен: ${webhookUrl}`);
        } else {
          console.error(`[Telegram] Ошибка установки webhook:`, result.description);
        }
      } catch (error) {
        console.error(`[Telegram] Не удалось установить webhook:`, error);
      }
    } else {
      console.warn("[Telegram] NEXT_PUBLIC_APP_URL или TELEGRAM_BOT_TOKEN не заданы, webhook не установлен");
    }
  }
}
