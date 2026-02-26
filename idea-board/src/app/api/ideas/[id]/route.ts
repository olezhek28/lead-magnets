import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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

  const updated = db.prepare("SELECT * FROM ideas WHERE id = ?").get(id);
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
