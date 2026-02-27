"use client";

import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { VoteButton } from "./vote-button";
import { useAuth } from "./auth-provider";
import type { Idea } from "@/types/idea";

export function IdeaCard({ idea }: { idea: Idea }) {
  const { user } = useAuth();
  const date = new Date(idea.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex gap-4 bg-bg-card border border-border rounded-[20px] p-5 hover:border-border/80 transition-colors">
      <VoteButton ideaId={idea.id} votesCount={idea.votes_count} userVoted={!!idea.user_voted} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <StatusBadge status={idea.status} />
          <CategoryBadge category={idea.category} />
        </div>

        <Link href={`/ideas/${idea.id}`} className="text-lg font-bold mb-1 text-white hover:text-accent transition-colors block">
          {idea.title}
        </Link>
        <p className="text-text-secondary text-sm mb-3 line-clamp-2">{idea.description}</p>

        {idea.status === "done" && idea.result_url && (
          <a href={idea.result_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent text-sm hover:underline mb-3">
            Смотреть результат &rarr;
          </a>
        )}

        <div className="flex items-center gap-3 text-xs text-text-secondary">
          {user?.isAdmin && <span>@{idea.author_username || idea.author_name}</span>}
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
