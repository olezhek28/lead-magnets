import { Metadata } from "next";
import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { IdeaPageClient } from "./idea-page-client";

interface Props {
  params: Promise<{ id: string }>;
}

function getIdea(id: string) {
  const db = getDb();
  return db.prepare(`
    SELECT i.*, u.username as author_username, u.first_name as author_name
    FROM ideas i
    JOIN users u ON u.id = i.author_id
    WHERE i.id = ? AND i.status NOT IN ('moderation', 'archived')
  `).get(id) as any;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const idea = getIdea(id);

  if (!idea) {
    return { title: "Идея не найдена" };
  }

  const CATEGORY_MAP: Record<string, string> = {
    youtube: "YouTube",
    telegram: "Telegram",
    course: "Курс",
    tool: "Инструмент",
  };

  const category = CATEGORY_MAP[idea.category] || idea.category;

  return {
    title: `${idea.title} — Idea Board`,
    description: idea.description,
    openGraph: {
      title: `${idea.title} | ${category}`,
      description: `${idea.description}\n\nГолосов: ${idea.votes_count}`,
      url: `https://ideas.olezhek28.courses/ideas/${id}`,
      siteName: "Idea Board",
      type: "article",
    },
  };
}

export default async function IdeaPage({ params }: Props) {
  const { id } = await params;
  const idea = getIdea(id);

  if (!idea) {
    notFound();
  }

  return <IdeaPageClient idea={idea} />;
}
