import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { ideaId, action, title, description } = await request.json();

  const db = getDb();
  const idea = db.prepare("SELECT * FROM ideas WHERE id = ? AND status = 'moderation'").get(ideaId) as any;

  if (!idea) {
    return NextResponse.json({ error: "Идея не найдена или уже обработана" }, { status: 404 });
  }

  if (action === "approve") {
    db.prepare("UPDATE ideas SET status = 'new', updated_at = datetime('now') WHERE id = ?").run(ideaId);
  } else if (action === "reject") {
    db.prepare("DELETE FROM ideas WHERE id = ?").run(ideaId);
    db.prepare("UPDATE users SET ideas_this_month = MAX(0, ideas_this_month - 1) WHERE id = ?").run(idea.author_id);
  } else if (action === "edit_approve") {
    if (!title || !description) {
      return NextResponse.json({ error: "Укажите заголовок и описание" }, { status: 400 });
    }
    db.prepare(
      "UPDATE ideas SET status = 'new', title = ?, description = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(title, description, ideaId);
  } else {
    return NextResponse.json({ error: "Невалидное действие" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
