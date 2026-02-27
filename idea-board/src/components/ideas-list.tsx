"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { IdeaCard } from "./idea-card";
import type { Idea } from "@/types/idea";

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

interface IdeasResponse {
  ideas: Idea[];
  pagination: Pagination;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function buildSwrKey(searchParams: URLSearchParams): string {
  const normalized = new URLSearchParams();
  const sort = searchParams.get("sort");
  if (sort && sort !== "popular") normalized.set("sort", sort);
  const category = searchParams.get("category");
  if (category) normalized.set("category", category);
  const status = searchParams.get("status");
  if (status) normalized.set("status", status);
  const q = searchParams.get("q");
  if (q) normalized.set("q", q);
  const page = searchParams.get("page");
  if (page && page !== "1") normalized.set("page", page);
  return `/api/ideas?${normalized.toString()}`;
}

export function IdeasList() {
  const searchParams = useSearchParams();
  const swrKey = buildSwrKey(searchParams);

  const { data, isLoading, isValidating } = useSWR<IdeasResponse>(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-card border border-border rounded-[20px] p-5 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const ideas = data?.ideas ?? [];
  const pagination = data?.pagination ?? null;

  if (ideas.length === 0 && !isValidating) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary text-lg">Идей пока нет</p>
        <p className="text-text-secondary text-sm mt-1">Будь первым — предложи тему!</p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 transition-opacity duration-150 ${isValidating ? "opacity-60" : "opacity-100"}`}>
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
