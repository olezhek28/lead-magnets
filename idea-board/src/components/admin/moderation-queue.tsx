"use client";

import { useState, useEffect } from "react";
import { CategoryBadge } from "../category-badge";
import type { Idea } from "@/types/idea";

export function ModerationQueue() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchIdeas = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/ideas?status=moderation");
    const data = await res.json();
    setIdeas(data.ideas);
    setLoading(false);
  };

  useEffect(() => { fetchIdeas(); }, []);

  const moderate = async (ideaId: number, action: string, title?: string, description?: string) => {
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, action, title, description }),
    });
    setEditingId(null);
    fetchIdeas();
  };

  if (loading) return <div className="text-text-secondary">Загрузка...</div>;

  if (ideas.length === 0) {
    return <div className="text-text-secondary text-center py-10">Нет идей на модерации</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm mb-2">Идей в очереди: {ideas.length}</p>
      {ideas.map((idea) => (
        <div key={idea.id} className="bg-bg-card border border-border rounded-[20px] p-5">
          {editingId === idea.id ? (
            <div className="space-y-3">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-bg-base border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent/50" />
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3}
                className="w-full bg-bg-base border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent/50 resize-none" />
              <div className="flex gap-2">
                <button onClick={() => moderate(idea.id, "edit_approve", editTitle, editDescription)}
                  className="bg-status-done text-white px-4 py-2 rounded-[1000px] text-sm font-medium">
                  Сохранить и одобрить
                </button>
                <button onClick={() => setEditingId(null)} className="text-text-secondary text-sm hover:text-text-primary">
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={idea.category} />
                    <span className="text-xs text-text-secondary">@{idea.author_username || idea.author_name}</span>
                    <span className="text-xs text-text-secondary">{new Date(idea.created_at).toLocaleDateString("ru-RU")}</span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{idea.title}</h3>
                  <p className="text-text-secondary text-sm">{idea.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => moderate(idea.id, "approve")}
                  className="bg-status-done text-white px-4 py-2 rounded-[1000px] text-sm font-medium">Одобрить</button>
                <button onClick={() => { setEditingId(idea.id); setEditTitle(idea.title); setEditDescription(idea.description); }}
                  className="bg-status-planned text-white px-4 py-2 rounded-[1000px] text-sm font-medium">Редактировать</button>
                <button onClick={() => moderate(idea.id, "reject")}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded-[1000px] text-sm font-medium">Отклонить</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
