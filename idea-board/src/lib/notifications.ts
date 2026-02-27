import { getDb } from "./db";
import { sendTelegramMessage, sendTelegramMessageWithButtons } from "./telegram";

const ADMIN_TELEGRAM_ID = Number(process.env.ADMIN_TELEGRAM_ID || "0");

import { CATEGORY_LABELS } from "./constants";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://ideas.olezhek28.courses";
}

function getIdeaUrl(ideaId: number) {
  return `${getAppUrl()}/ideas/${ideaId}`;
}

type AuthorNotifiable = { chat_id: number; notifications_enabled: number; bot_started: number } | undefined;

function getAuthorForNotification(authorId: number): AuthorNotifiable {
  const db = getDb();
  return db
    .prepare("SELECT chat_id, notifications_enabled, bot_started FROM users WHERE id = ?")
    .get(authorId) as AuthorNotifiable;
}

function canNotify(author: AuthorNotifiable): author is { chat_id: number; notifications_enabled: number; bot_started: number } {
  return !!author && !!author.notifications_enabled && !!author.bot_started;
}

// --- Уведомление админу о новой идее ---

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
    `<b>${escapeHtml(idea.title)}</b>`,
    `${escapeHtml(idea.description)}`,
    ``,
    `📂 ${escapeHtml(categoryLabel)}`,
    `👤 ${escapeHtml(authorName)}`,
  ].join("\n");

  const buttons = [
    [
      { text: "✅ Опубликовать", callback_data: `approve_${idea.id}` },
      { text: "❌ Отклонить", callback_data: `reject_${idea.id}` },
    ],
  ];

  await sendTelegramMessageWithButtons(admin.chat_id, text, buttons);
}

// --- Shared-логика модерации ---

export function approveIdea(ideaId: number) {
  const db = getDb();
  db.prepare("UPDATE ideas SET status = 'new', updated_at = datetime('now') WHERE id = ?").run(ideaId);
}

export function approveIdeaWithEdit(ideaId: number, title: string, description: string) {
  const db = getDb();
  db.prepare(
    "UPDATE ideas SET status = 'new', title = ?, description = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(title, description, ideaId);
}

export function rejectIdea(ideaId: number, authorId: number) {
  const db = getDb();
  db.prepare("DELETE FROM ideas WHERE id = ?").run(ideaId);
  db.prepare("UPDATE users SET ideas_this_month = MAX(0, ideas_this_month - 1) WHERE id = ?").run(authorId);
}

// --- Уведомления автору ---

export async function notifyAuthorIdeaApproved(idea: { id: number; title: string; author_id: number }) {
  const author = getAuthorForNotification(idea.author_id);
  if (!canNotify(author)) return;

  const ideaUrl = getIdeaUrl(idea.id);
  const text = [
    `🎉 <b>Спасибо за идею!</b>`,
    ``,
    `Твоя идея «<b>${escapeHtml(idea.title)}</b>» прошла модерацию и опубликована.`,
    ``,
    `Поделись ссылкой с друзьями, чтобы за неё проголосовали:`,
    `${ideaUrl}`,
  ].join("\n");

  await sendTelegramMessage(author.chat_id, text);
}

export async function notifyAuthorIdeaRejected(ideaTitle: string, authorId: number) {
  const author = getAuthorForNotification(authorId);
  if (!canNotify(author)) return;

  const text = [
    `😔 Спасибо за идею «<b>${escapeHtml(ideaTitle)}</b>»!`,
    ``,
    `К сожалению, она не прошла модерацию. Попробуй переформулировать или предложить другую тему.`,
    ``,
    `Слот для идеи возвращён — можешь предложить новую.`,
  ].join("\n");

  await sendTelegramMessage(author.chat_id, text);
}

export async function notifyAuthorIdeaDone(idea: { id: number; title: string; author_id: number; result_url?: string }) {
  const author = getAuthorForNotification(idea.author_id);
  if (!canNotify(author)) return;

  const ideaUrl = getIdeaUrl(idea.id);
  const resultLink = idea.result_url
    ? `👉 <a href="${idea.result_url}">Смотреть результат</a>`
    : `👉 <a href="${ideaUrl}">Перейти к идее</a>`;

  const lines = [
    `🔥 <b>Идея реализована!</b>`,
    ``,
    `Твоя идея «<b>${escapeHtml(idea.title)}</b>» воплощена в жизнь.`,
    ``,
    resultLink,
  ];

  await sendTelegramMessage(author.chat_id, lines.join("\n"));
}

export async function notifyAuthorNewVote(ideaId: number, voterId: number) {
  const db = getDb();

  const idea = db.prepare("SELECT id, title, author_id, votes_count FROM ideas WHERE id = ?").get(ideaId) as {
    id: number; title: string; author_id: number; votes_count: number;
  } | undefined;

  if (!idea) return;
  if (idea.author_id === voterId) return;

  const author = getAuthorForNotification(idea.author_id);
  if (!canNotify(author)) return;

  const ideaUrl = getIdeaUrl(idea.id);
  const text = `👍 +1 за идею «<b>${escapeHtml(idea.title)}</b>»\nВсего голосов: ${idea.votes_count}\n\n👉 <a href="${ideaUrl}">Перейти к идее</a>`;

  await sendTelegramMessage(author.chat_id, text);
}
