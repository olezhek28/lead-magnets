"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "../status-badge";
import { CategoryBadge } from "../category-badge";

const STATUSES = ["new", "planned", "in_progress", "done"];
const STATUS_LABELS: Record<string, string> = {
  new: "Новая", planned: "В планах", in_progress: "В работе", done: "Сделано"
};

interface Idea {
  id: number;
  title: string;
  category: string;
  status: string;
  result_url: string | null;
  votes_count: number;
  author_username: string | null;
  author_name: string;
}

export function IdeaManager() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("new");
  const [resultUrl, setResultUrl] = useState("");
  const [changingId, setChangingId] = useState<number | null>(null);

  const fetchIdeas = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/ideas?status=${filterStatus}`);
    const data = await res.json();
    setIdeas(data.ideas);
    setLoading(false);
  };

  useEffect(() => { fetchIdeas(); }, [filterStatus]);

  const changeStatus = async (ideaId: number, newStatus: string, url?: string) => {
    await fetch(`/api/ideas/${ideaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, result_url: url }),
    });
    setChangingId(null);
    setResultUrl("");
    fetchIdeas();
  };

  const deleteIdea = async (ideaId: number) => {
    if (!confirm("Удалить идею безвозвратно?")) return;
    await fetch(`/api/ideas/${ideaId}`, { method: "DELETE" });
    fetchIdeas();
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-[1000px] text-sm font-medium transition-colors ${
              filterStatus === s ? "bg-accent text-bg-base" : "text-text-secondary hover:text-text-primary"
            }`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-text-secondary">Загрузка...</div>
      ) : ideas.length === 0 ? (
        <div className="text-text-secondary text-center py-10">Нет идей с таким статусом</div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-bg-card border border-border rounded-[20px] p-4">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[50px]">
                  <div className="text-accent font-bold text-lg">{idea.votes_count}</div>
                  <div className="text-text-secondary text-xs">голосов</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status={idea.status} />
                    <CategoryBadge category={idea.category} />
                  </div>
                  <h4 className="font-semibold text-white truncate">{idea.title}</h4>
                  <span className="text-xs text-text-secondary">@{idea.author_username || idea.author_name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {idea.status !== "done" && (
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "done") { setChangingId(idea.id); }
                        else { changeStatus(idea.id, val); }
                        e.target.value = "";
                      }}
                      defaultValue=""
                      className="bg-bg-base border border-border rounded-xl px-2 py-1.5 text-sm text-text-secondary">
                      <option value="" disabled>Статус →</option>
                      {STATUSES.filter((s) => s !== idea.status).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  )}
                  <button onClick={() => deleteIdea(idea.id)} className="text-red-400 hover:text-red-300 text-sm">Удалить</button>
                </div>
              </div>

              {changingId === idea.id && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <input value={resultUrl} onChange={(e) => setResultUrl(e.target.value)}
                    placeholder="Ссылка на результат (обязательно)"
                    className="flex-1 bg-bg-base border border-border rounded-xl px-3 py-1.5 text-sm" />
                  <button onClick={() => changeStatus(idea.id, "done", resultUrl)}
                    disabled={!resultUrl}
                    className="bg-status-done text-white px-3 py-1.5 rounded-[1000px] text-sm disabled:opacity-50">Готово</button>
                  <button onClick={() => { setChangingId(null); setResultUrl(""); }}
                    className="text-text-secondary text-sm">Отмена</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
