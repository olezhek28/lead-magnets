"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { useAuth } from "./auth-provider";

const CATEGORIES = [
  { value: "youtube", label: "YouTube" },
  { value: "telegram", label: "Telegram" },
  { value: "course", label: "Курс" },
  { value: "tool", label: "Инструмент" },
];

export function IdeaForm({ onCreated }: { onCreated?: () => void }) {
  const { user, refreshUser } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("youtube");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const limit = user.monthlyIdeaLimit || 3;
  const ideasLeft = limit - (user.ideasThisMonth || 0);
  const canCreate = ideasLeft > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      refreshUser();
      globalMutate((key: unknown) => typeof key === "string" && key.startsWith("/api/ideas?"));
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        onCreated?.();
      }, 2000);
    } catch {
      setError("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} disabled={!canCreate}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-[1000px] font-semibold text-sm transition-colors ${canCreate ? "bg-accent text-bg-base hover:bg-accent-hover" : "bg-bg-card text-text-secondary cursor-not-allowed"}`}
        title={!canCreate ? `Лимит идей исчерпан (${limit}/${limit}). Новые идеи с 1-го числа` : undefined}>
        + Предложить идею
        <span className="text-xs opacity-70">({ideasLeft}/{limit})</span>
      </button>
    );
  }

  if (success) {
    return (
      <div className="bg-bg-card border border-status-done/30 rounded-[20px] p-6 text-center">
        <p className="text-status-done font-semibold">Идея отправлена на модерацию!</p>
        <p className="text-text-secondary text-sm mt-1">Ты получишь уведомление, когда она будет опубликована</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-[20px] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Предложить идею</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary text-2xl leading-none">&times;</button>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-xl">{error}</p>}

      <div>
        <label className="block text-sm text-text-secondary mb-1">Заголовок</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required
          placeholder="Тема для видео, поста или курса"
          className="w-full bg-bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50" />
        <span className="text-xs text-text-secondary mt-1 block text-right">{title.length}/100</span>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Почему это важно?</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} minLength={30} maxLength={500} required rows={3}
          placeholder="Опиши, почему тебе это интересно и чему ты хочешь научиться (мин. 30 символов)"
          className="w-full bg-bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 resize-none" />
        <span className={`text-xs mt-1 block text-right ${description.length < 30 ? "text-red-400" : "text-text-secondary"}`}>
          {description.length}/500 {description.length < 30 && `(мин. ${30 - description.length})`}
        </span>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Категория</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.value} type="button" onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-[1000px] text-sm transition-colors ${category === c.value ? "bg-accent text-bg-base font-semibold" : "bg-bg-base border border-border text-text-secondary hover:border-accent/30"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading || title.length === 0 || description.length < 30}
        className="w-full bg-accent text-bg-base font-semibold py-3 rounded-[1000px] hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {loading ? "Отправляю..." : "Отправить на модерацию"}
      </button>
    </form>
  );
}
