"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

const SORTS = [
  { value: "popular", label: "Популярное" },
  { value: "trending", label: "Трендовое" },
  { value: "new", label: "Новое" },
];

import { CATEGORY_LABELS } from "@/lib/constants";

const CATEGORIES = [
  { value: "", label: "Все" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

const STATUSES = [
  { value: "", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "planned", label: "В планах" },
  { value: "done", label: "Сделано" },
];

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") || "popular";
  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.replace(`/?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("q", search);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск идей..."
          className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 pl-10 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/50"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </form>

      <div className="flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <button key={s.value} onClick={() => updateParams("sort", s.value === "popular" ? "" : s.value)}
            className={`px-3 py-1.5 rounded-[1000px] text-sm font-medium transition-colors ${currentSort === s.value ? "bg-accent text-bg-base" : "bg-bg-card text-text-secondary border border-border hover:border-accent/30"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => updateParams("category", c.value)}
            className={`px-3 py-1.5 rounded-[1000px] text-xs font-medium transition-colors ${currentCategory === c.value ? "bg-white/10 text-white" : "text-text-secondary hover:text-text-primary"}`}>
            {c.label}
          </button>
        ))}
        <span className="text-border mx-1">|</span>
        {STATUSES.map((s) => (
          <button key={s.value} onClick={() => updateParams("status", s.value)}
            className={`px-3 py-1.5 rounded-[1000px] text-xs font-medium transition-colors ${currentStatus === s.value ? "bg-white/10 text-white" : "text-text-secondary hover:text-text-primary"}`}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
