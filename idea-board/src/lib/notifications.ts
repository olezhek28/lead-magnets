import { getDb } from "./db";
import { sendTelegramMessage, sendTelegramMessageWithButtons } from "./telegram";

const ADMIN_TELEGRAM_ID = Number(process.env.ADMIN_TELEGRAM_ID || "0");

const CATEGORY_LABELS: Record<string, string> = {
  youtube: "YouTube",
  telegram: "Telegram",
  course: "Курс",
  tool: "Инструмент",
};

export async function notifyAdminNewIdea(
  idea: { id: number; title: string; description: string; category: string },
  author: { username?: string; first_name: string }
) {
  const db = getDb();
  const admin = db
    .prepare("SELECT chat_id FROM users WHERE telegram_id = ? AND bot_started = 1")
    .get(ADMIN_TELEGRAM_ID) as { chat_id: number } | undefined;

  if (!admin) return;

  const authorName = author.username ? `@${author.username}` : author.first_name;
  const categoryLabel = CATEGORY_LABELS[idea.category] || idea.category;

  const text = [
    `🆕 <b>Новая идея на модерации</b>`,
    ``,
    `<b>${idea.title}</b>`,
    `${idea.description}`,
    ``,
    `📂 ${categoryLabel}`,
    `👤 ${authorName}`,
  ].join("\n");

  const buttons = [
    [
      { text: "✅ Опубликовать", callback_data: `approve_${idea.id}` },
      { text: "❌ Отклонить", callback_data: `reject_${idea.id}` },
    ],
  ];

  await sendTelegramMessageWithButtons(admin.chat_id, text, buttons);
}

export async function notifyAuthorIdeaApproved(idea: { id: number; title: string; author_id: number }) {
  const db = getDb();
  const author = db
    .prepare("SELECT chat_id, notifications_enabled, bot_started FROM users WHERE id = ?")
    .get(idea.author_id) as { chat_id: number; notifications_enabled: number; bot_started: number } | undefined;

  if (!author || !author.notifications_enabled || !author.bot_started) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ideas.olezhek28.courses";
  const ideaUrl = `${appUrl}?idea=${idea.id}`;
  const text = `🎉 Твоя идея «<b>${idea.title}</b>» прошла модерацию и опубликована!\n\n👉 <a href="${ideaUrl}">Перейти к идее</a>`;

  await sendTelegramMessage(author.chat_id, text);
}

export async function notifyAuthorNewVote(
  ideaId: number,
  voterId: number
) {
  const db = getDb();

  const idea = db.prepare("SELECT id, title, author_id, votes_count FROM ideas WHERE id = ?").get(ideaId) as {
    id: number; title: string; author_id: number; votes_count: number;
  } | undefined;

  if (!idea) return;

  // Не уведомляем, если автор голосует за свою идею
  if (idea.author_id === voterId) return;

  const author = db
    .prepare("SELECT chat_id, notifications_enabled, bot_started FROM users WHERE id = ?")
    .get(idea.author_id) as { chat_id: number; notifications_enabled: number; bot_started: number } | undefined;

  if (!author || !author.notifications_enabled || !author.bot_started) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ideas.olezhek28.courses";
  const ideaUrl = `${appUrl}?idea=${idea.id}`;
  const text = `👍 +1 за идею «<b>${idea.title}</b>»\nВсего голосов: ${idea.votes_count}\n\n👉 <a href="${ideaUrl}">Перейти к идее</a>`;

  await sendTelegramMessage(author.chat_id, text);
}
