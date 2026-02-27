"use client";

import { StatusBadge } from "@/components/status-badge";
import { CategoryBadge } from "@/components/category-badge";
import { VoteButton } from "@/components/vote-button";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import type { Idea } from "@/types/idea";

export function IdeaPageClient({ idea }: { idea: Idea }) {
  const { user } = useAuth();
  const date = new Date(idea.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="max-w-[700px] mx-auto px-5 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-text-secondary text-sm hover:text-white transition-colors mb-6"
      >
        &larr; Все идеи
      </Link>

      <div className="bg-bg-card border border-border rounded-[20px] p-6">
        <div className="flex gap-5">
          <VoteButton ideaId={idea.id} votesCount={idea.votes_count} userVoted={!!idea.user_voted} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <StatusBadge status={idea.status} />
              <CategoryBadge category={idea.category} />
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">{idea.title}</h1>
            <p className="text-text-secondary leading-relaxed mb-4">{idea.description}</p>

            {idea.status === "done" && idea.result_url && (
              <a
                href={idea.result_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent font-semibold hover:underline mb-4"
              >
                Смотреть результат &rarr;
              </a>
            )}

            <div className="flex items-center gap-3 text-sm text-text-secondary pt-3 border-t border-border">
              {user?.isAdmin && <><span>@{idea.author_username || idea.author_name}</span><span>&middot;</span></>}
              <span>{date}</span>
              <span>&middot;</span>
              <span>{idea.votes_count} {pluralVotes(idea.votes_count)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-text-secondary text-sm mb-3">
          Нравится идея? Поделись ссылкой с друзьями!
        </p>
        <CopyLinkButton />
      </div>
    </main>
  );
}

function CopyLinkButton() {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-accent text-bg-base font-semibold text-sm rounded-[1000px] hover:bg-accent-hover transition-colors"
    >
      Скопировать ссылку
    </button>
  );
}

function pluralVotes(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return "голосов";
  if (mod10 === 1) return "голос";
  if (mod10 >= 2 && mod10 <= 4) return "голоса";
  return "голосов";
}
