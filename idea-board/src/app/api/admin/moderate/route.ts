import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  approveIdea,
  approveIdeaWithEdit,
  rejectIdea,
  notifyAuthorIdeaApproved,
  notifyAuthorIdeaRejected,
} from "@/lib/notifications";

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
    approveIdea(ideaId);
    notifyAuthorIdeaApproved(idea).catch((err) =>
      console.error("Ошибка уведомления автора:", err)
    );
  } else if (action === "reject") {
    const ideaTitle = idea.title;
    const authorId = idea.author_id;
    rejectIdea(ideaId, authorId);
    notifyAuthorIdeaRejected(ideaTitle, authorId).catch((err) =>
      console.error("Ошибка уведомления автора (reject):", err)
    );
  } else if (action === "edit_approve") {
    if (!title || !description) {
      return NextResponse.json({ error: "Укажите заголовок и описание" }, { status: 400 });
    }
    approveIdeaWithEdit(ideaId, title, description);
    const updatedIdea = db.prepare("SELECT * FROM ideas WHERE id = ?").get(ideaId) as any;
    notifyAuthorIdeaApproved(updatedIdea).catch((err) =>
      console.error("Ошибка уведомления автора:", err)
    );
  } else {
    return NextResponse.json({ error: "Невалидное действие" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
