"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalIdeas: number;
  totalUsers: number;
  totalVotes: number;
  pendingModeration: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/ideas?status=new")
      .then((res) => res.json())
      .then((data) => setStats(data.stats));
  }, []);

  if (!stats) return <div className="text-text-secondary">Загрузка...</div>;

  const items = [
    { label: "Идей", value: stats.totalIdeas, color: "text-accent" },
    { label: "Пользователей", value: stats.totalUsers, color: "text-status-planned" },
    { label: "Голосов", value: stats.totalVotes, color: "text-status-done" },
    { label: "На модерации", value: stats.pendingModeration, color: "text-status-moderation" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-bg-card border border-border rounded-[20px] p-5 text-center">
          <div className={`text-3xl font-extrabold ${item.color}`}>{item.value}</div>
          <div className="text-text-secondary text-sm mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
