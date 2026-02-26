import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendTelegramMessage, answerCallbackQuery, editTelegramMessage } from "@/lib/telegram";
import { isAdminTelegramId } from "@/lib/auth";
import { notifyAuthorIdeaApproved } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();

  // Обработка callback_query (инлайн-кнопки модерации)
  if (body.callback_query) {
    const cq = body.callback_query;
    const data = cq.data as string;
    const telegramId = cq.from.id;
    const chatId = cq.message.chat.id;
    const messageId = cq.message.message_id;

    if (!isAdminTelegramId(telegramId)) {
      await answerCallbackQuery(cq.id, "Только админ может модерировать");
      return NextResponse.json({ ok: true });
    }

    const match = data.match(/^(approve|reject)_(\d+)$/);
    if (!match) {
      await answerCallbackQuery(cq.id);
      return NextResponse.json({ ok: true });
    }

    const action = match[1];
    const ideaId = Number(match[2]);
    const db = getDb();

    const idea = db.prepare("SELECT * FROM ideas WHERE id = ?").get(ideaId) as any;

    if (!idea || idea.status !== "moderation") {
      await answerCallbackQuery(cq.id, "Уже обработано");
      return NextResponse.json({ ok: true });
    }

    const originalText = cq.message.text || "";

    if (action === "approve") {
      db.prepare("UPDATE ideas SET status = 'new' WHERE id = ?").run(ideaId);
      await editTelegramMessage(chatId, messageId, originalText + "\n\n✅ Опубликовано");
      await answerCallbackQuery(cq.id, "Опубликовано!");
      notifyAuthorIdeaApproved(idea).catch((err) =>
        console.error("Ошибка уведомления автора:", err)
      );
    } else {
      db.prepare("UPDATE users SET ideas_this_month = MAX(0, ideas_this_month - 1) WHERE id = ?").run(idea.author_id);
      db.prepare("DELETE FROM ideas WHERE id = ?").run(ideaId);
      await editTelegramMessage(chatId, messageId, originalText + "\n\n❌ Отклонено");
      await answerCallbackQuery(cq.id, "Отклонено");
    }

    return NextResponse.json({ ok: true });
  }

  const message = body.message;

  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const telegramId = message.from.id;
  const chatId = message.chat.id;
  const username = message.from.username || null;
  const firstName = message.from.first_name || "User";

  const text = message.text.trim();

  // Обработка /start auth_<token>
  if (text.startsWith("/start")) {
    const parts = text.split(" ");
    const payload = parts[1] || "";

    if (payload.startsWith("auth_")) {
      const token = payload.replace("auth_", "");
      const db = getDb();

      const authToken = db.prepare(
        "SELECT * FROM auth_tokens WHERE token = ? AND confirmed = 0 AND expires_at > datetime('now')"
      ).get(token) as any;

      if (!authToken) {
        await sendTelegramMessage(chatId, "Ссылка для авторизации устарела или уже использована. Попробуй ещё раз на сайте.");
        return NextResponse.json({ ok: true });
      }

      let user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId) as any;

      if (!user) {
        const isAdmin = isAdminTelegramId(telegramId);
        db.prepare(
          "INSERT INTO users (telegram_id, chat_id, username, first_name, bot_started, is_admin) VALUES (?, ?, ?, ?, 1, ?)"
        ).run(telegramId, chatId, username, firstName, isAdmin ? 1 : 0);
        user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId);
      } else {
        db.prepare(
          "UPDATE users SET chat_id = ?, username = ?, first_name = ?, bot_started = 1 WHERE telegram_id = ?"
        ).run(chatId, username, firstName, telegramId);
      }

      db.prepare(
        "UPDATE auth_tokens SET confirmed = 1, telegram_id = ?, chat_id = ? WHERE token = ?"
      ).run(telegramId, chatId, token);

      await sendTelegramMessage(
        chatId,
        "Авторизация прошла! Возвращайся на сайт.\n\nЯ буду присылать уведомления о твоих идеях и голосах.\n/mute — отключить уведомления"
      );

      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      chatId,
      `Привет, ${firstName}! Я бот Idea Board.\n\nАвторизуйся на сайте, чтобы предлагать идеи и голосовать:\n${process.env.NEXT_PUBLIC_APP_URL || "https://ideas.olezhek28.dev"}`
    );
    return NextResponse.json({ ok: true });
  }

  if (text === "/mute") {
    const db = getDb();
    db.prepare("UPDATE users SET notifications_enabled = 0 WHERE telegram_id = ?").run(telegramId);
    await sendTelegramMessage(chatId, "Уведомления отключены. /unmute — включить обратно.");
    return NextResponse.json({ ok: true });
  }

  if (text === "/unmute") {
    const db = getDb();
    db.prepare("UPDATE users SET notifications_enabled = 1 WHERE telegram_id = ?").run(telegramId);
    await sendTelegramMessage(chatId, "Уведомления включены!");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
