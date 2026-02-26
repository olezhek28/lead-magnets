"use client";

import { useState } from "react";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { IdeaManager } from "@/components/admin/idea-manager";
import { DashboardStats } from "@/components/admin/dashboard-stats";

const TABS = [
  { id: "moderation", label: "Модерация" },
  { id: "ideas", label: "Все идеи" },
  { id: "stats", label: "Статистика" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("moderation");

  return (
    <main className="max-w-[1200px] mx-auto px-5 py-8">
      <h1 className="text-3xl font-extrabold text-white mb-6">Админ-панель</h1>

      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-[1000px] text-sm font-medium transition-colors ${
              tab === t.id ? "bg-accent text-bg-base" : "text-text-secondary hover:text-text-primary"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "moderation" && <ModerationQueue />}
      {tab === "ideas" && <IdeaManager />}
      {tab === "stats" && <DashboardStats />}
    </main>
  );
}
