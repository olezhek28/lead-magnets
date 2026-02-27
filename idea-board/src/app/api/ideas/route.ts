import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyJwt, getCurrentUser } from "@/lib/auth";
import { getUserWithBalance, MONTHLY_IDEA_LIMIT } from "@/lib/votes";
import { notifyAdminNewIdea } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { queryIdeas } from "@/lib/ideas-query";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  let currentUserId: number | null = null;
  const token = request.cookies.get("auth_token")?.value;
  if (token) {
    const payload = await verifyJwt(token);
    if (payload) currentUserId = payload.userId;
  }

  const data = queryIdeas({
    sort: searchParams.get("sort") || "popular",
    category: searchParams.get("category"),
    status: searchParams.get("status"),
    search: searchParams.get("q") || "",
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    currentUserId,
  });

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const rl = rateLimit(`ideas:${session.userId}`, 5, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Слишком много запросов, подождите минуту" }, { status: 429 });
  }

  const user = getUserWithBalance(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  if (user.ideas_this_month >= MONTHLY_IDEA_LIMIT) {
    return NextResponse.json({
      error: `Вы исчерпали лимит идей в этом месяце (${MONTHLY_IDEA_LIMIT}/${MONTHLY_IDEA_LIMIT}). Новые идеи можно предлагать с 1-го числа следующего месяца`,
    }, { status: 429 });
  }

  const body = await request.json();
  const { title, description, category } = body;

  if (!title || title.length > 100) {
    return NextResponse.json({ error: "Заголовок обязателен (макс. 100 символов)" }, { status: 400 });
  }
  if (!description || description.length < 30 || description.length > 500) {
    return NextResponse.json({ error: "Описание обязательно (30-500 символов)" }, { status: 400 });
  }
  const validCategories = ["youtube", "telegram", "course", "tool"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Невалидная категория" }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare(
    "INSERT INTO ideas (title, description, category, author_id, status) VALUES (?, ?, ?, ?, 'moderation')"
  ).run(title.trim(), description.trim(), category, session.userId);

  db.prepare("UPDATE users SET ideas_this_month = ideas_this_month + 1 WHERE id = ?").run(session.userId);

  const idea = db.prepare("SELECT * FROM ideas WHERE id = ?").get(result.lastInsertRowid) as any;

  notifyAdminNewIdea(idea, user).catch((err) =>
    console.error("Ошибка уведомления админа:", err)
  );

  return NextResponse.json({ idea }, { status: 201 });
}
