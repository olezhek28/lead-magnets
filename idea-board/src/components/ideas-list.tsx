"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IdeaCard } from "./idea-card";

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  result_url: string | null;
  votes_count: number;
  user_voted: number | null;
  author_username: string | null;
  author_name: string;
  created_at: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

export function IdeasList() {
  const searchParams = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    fetch(`/api/ideas?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setIdeas(data.ideas);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-card border border-border rounded-[20px] p-5 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary text-lg">Идей пока нет</p>
        <p className="text-text-secondary text-sm mt-1">Будь первым — предложи тему!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(page));
            return (
              <a key={page} href={`/?${params.toString()}`}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                  page === pagination.page ? "bg-accent text-bg-base" : "bg-bg-card text-text-secondary border border-border hover:border-accent/30"
                }`}>
                {page}
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
