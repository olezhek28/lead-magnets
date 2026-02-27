import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyJwt, getCurrentUser } from "@/lib/auth";
import { notifyAuthorIdeaDone } from "@/lib/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  let currentUserId: number | null = null;
  const token = request.cookies.get("auth_token")?.value;
  if (token) {
    const payload = await verifyJwt(token);
    if (payload) currentUserId = payload.userId;
  }

  const voteSelect = currentUserId
    ? `, (SELECT 1 FROM votes WHERE user_id = ? AND idea_id = i.id) as user_voted`
    : `, 0 as user_voted`;

  const queryParams: any[] = [];
  if (currentUserId) queryParams.push(currentUserId);
  queryParams.push(id);

  const idea = db.prepare(`
    SELECT i.*, u.username as author_username, u.first_name as author_name
    ${voteSelect}
    FROM ideas i
    JOIN users u ON u.id = i.author_id
    WHERE i.id = ? AND i.status NOT IN ('moderation', 'archived')
  `).get(...queryParams);

  if (!idea) {
    return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
  }

  return NextResponse.json({ idea });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const db = getDb();

  const idea = db.prepare("SELECT * FROM ideas WHERE id = ?").get(id) as any;
  if (!idea) {
    return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
  }

  const { status, title, description, result_url } = body;

  if (status === "done" && !result_url && !idea.result_url) {
    return NextResponse.json({ error: "Для статуса 'Сделано' обязательна ссылка на результат" }, { status: 400 });
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (status) { updates.push("status = ?"); values.push(status); }
  if (title) { updates.push("title = ?"); values.push(title); }
  if (description) { updates.push("description = ?"); values.push(description); }
  if (result_url !== undefined) { updates.push("result_url = ?"); values.push(result_url); }

  updates.push("updated_at = datetime('now')");

  db.prepare(`UPDATE ideas SET ${updates.join(", ")} WHERE id = ?`).run(...values, id);

  const updated = db.prepare("SELECT * FROM ideas WHERE id = ?").get(id) as any;

  if (status === "done" && idea.status !== "done") {
    notifyAuthorIdeaDone(updated).catch((err) =>
      console.error("Ошибка уведомления автора (done):", err)
    );
  }

  return NextResponse.json({ idea: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();

  db.prepare("DELETE FROM votes WHERE idea_id = ?").run(id);
  db.prepare("DELETE FROM ideas WHERE id = ?").run(id);

  return NextResponse.json({ ok: true });
}
