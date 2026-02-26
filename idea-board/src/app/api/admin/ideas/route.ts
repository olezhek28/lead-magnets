import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status") || "moderation";
  const db = getDb();

  const ideas = db.prepare(`
    SELECT i.*, u.username as author_username, u.first_name as author_name
    FROM ideas i
    JOIN users u ON u.id = i.author_id
    WHERE i.status = ?
    ORDER BY i.created_at DESC
  `).all(status);

  const stats = {
    totalIdeas: (db.prepare("SELECT COUNT(*) as c FROM ideas WHERE status NOT IN ('moderation', 'archived')").get() as any).c,
    totalUsers: (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c,
    totalVotes: (db.prepare("SELECT COUNT(*) as c FROM votes").get() as any).c,
    pendingModeration: (db.prepare("SELECT COUNT(*) as c FROM ideas WHERE status = 'moderation'").get() as any).c,
  };

  return NextResponse.json({ ideas, stats });
}
