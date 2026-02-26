import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserWithBalance } from "@/lib/votes";
import { notifyAuthorNewVote } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const user = getUserWithBalance(session.userId);

  const idea = db.prepare(
    "SELECT * FROM ideas WHERE id = ? AND status NOT IN ('moderation', 'archived') AND merged_into_id IS NULL"
  ).get(id) as any;

  if (!idea) {
    return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
  }

  const existingVote = db.prepare(
    "SELECT * FROM votes WHERE user_id = ? AND idea_id = ?"
  ).get(session.userId, id);

  if (existingVote) {
    return NextResponse.json({ error: "Вы уже голосовали за эту идею" }, { status: 409 });
  }

  if (user.votes_balance <= 0) {
    return NextResponse.json({ error: "У вас закончились голоса. Голоса восстанавливаются каждые 24 часа" }, { status: 429 });
  }

  const transaction = db.transaction(() => {
    db.prepare("INSERT INTO votes (user_id, idea_id) VALUES (?, ?)").run(session.userId, id);
    db.prepare("UPDATE ideas SET votes_count = votes_count + 1 WHERE id = ?").run(id);
    db.prepare("UPDATE users SET votes_balance = votes_balance - 1 WHERE id = ?").run(session.userId);
  });

  transaction();

  const updatedUser = db.prepare("SELECT votes_balance FROM users WHERE id = ?").get(session.userId) as any;
  const updatedIdea = db.prepare("SELECT votes_count FROM ideas WHERE id = ?").get(id) as any;

  notifyAuthorNewVote(Number(id), session.userId).catch((err) =>
    console.error("Ошибка уведомления о голосе:", err)
  );

  return NextResponse.json({
    votesCount: updatedIdea.votes_count,
    votesBalance: updatedUser.votes_balance,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const existingVote = db.prepare(
    "SELECT * FROM votes WHERE user_id = ? AND idea_id = ?"
  ).get(session.userId, id);

  if (!existingVote) {
    return NextResponse.json({ error: "Вы не голосовали за эту идею" }, { status: 404 });
  }

  const MAX_VOTES = 10;
  const user = db.prepare("SELECT votes_balance FROM users WHERE id = ?").get(session.userId) as any;

  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM votes WHERE user_id = ? AND idea_id = ?").run(session.userId, id);
    db.prepare("UPDATE ideas SET votes_count = votes_count - 1 WHERE id = ?").run(id);
    if (user.votes_balance < MAX_VOTES) {
      db.prepare("UPDATE users SET votes_balance = MIN(votes_balance + 1, ?) WHERE id = ?").run(MAX_VOTES, session.userId);
    }
  });

  transaction();

  const updatedUser = db.prepare("SELECT votes_balance FROM users WHERE id = ?").get(session.userId) as any;
  const updatedIdea = db.prepare("SELECT votes_count FROM ideas WHERE id = ?").get(id) as any;

  return NextResponse.json({
    votesCount: updatedIdea.votes_count,
    votesBalance: updatedUser.votes_balance,
  });
}
