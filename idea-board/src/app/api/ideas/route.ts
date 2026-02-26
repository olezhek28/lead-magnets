import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyJwt, getCurrentUser } from "@/lib/auth";
import { getUserWithBalance } from "@/lib/votes";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sort = searchParams.get("sort") || "popular";
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("q") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const db = getDb();

  let currentUserId: number | null = null;
  const token = request.cookies.get("auth_token")?.value;
  if (token) {
    const payload = await verifyJwt(token);
    if (payload) currentUserId = payload.userId;
  }

  const conditions: string[] = ["i.status NOT IN ('moderation', 'archived')", "i.merged_into_id IS NULL"];
  const params: any[] = [];

  if (category) {
    conditions.push("i.category = ?");
    params.push(category);
  }

  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }

  if (search) {
    conditions.push("(i.title LIKE ? OR i.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  let orderBy = "i.votes_count DESC, i.created_at DESC";
  let joinClause = "";

  if (sort === "trending") {
    joinClause = `
      LEFT JOIN (
        SELECT idea_id, COUNT(*) as recent_votes
        FROM votes
        WHERE voted_at > datetime('now', '-7 days')
        GROUP BY idea_id
      ) rv ON rv.idea_id = i.id
    `;
    orderBy = "COALESCE(rv.recent_votes, 0) DESC, i.votes_count DESC";
  } else if (sort === "new") {
    orderBy = "i.created_at DESC";
  }

  const voteSelect = currentUserId
    ? `, (SELECT 1 FROM votes WHERE user_id = ${currentUserId} AND idea_id = i.id) as user_voted`
    : `, 0 as user_voted`;

  const countSql = `SELECT COUNT(*) as total FROM ideas i ${where}`;
  const total = (db.prepare(countSql).get(...params) as any).total;

  const sql = `
    SELECT i.*, u.username as author_username, u.first_name as author_name
    ${voteSelect}
    FROM ideas i
    JOIN users u ON u.id = i.author_id
    ${joinClause}
    ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const ideas = db.prepare(sql).all(...params, limit, offset);

  return NextResponse.json({
    ideas,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const user = getUserWithBalance(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  if (user.ideas_this_month >= 3) {
    return NextResponse.json({
      error: "Вы исчерпали лимит идей в этом месяце (3/3). Новые идеи можно предлагать с 1-го числа следующего месяца",
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

  const idea = db.prepare("SELECT * FROM ideas WHERE id = ?").get(result.lastInsertRowid);

  return NextResponse.json({ idea }, { status: 201 });
}
