"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { useAuth } from "./auth-provider";

interface Props {
  ideaId: number;
  votesCount: number;
  userVoted: boolean;
  status?: string;
  onVoteChange?: (newCount: number, newBalance: number) => void;
}

export function VoteButton({ ideaId, votesCount: initialCount, userVoted: initialVoted, status, onVoteChange }: Props) {
  const { user, refreshUser } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleVote = async () => {
    if (!user || loading) return;

    setLoading(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      const method = voted ? "DELETE" : "POST";
      const res = await fetch(`/api/ideas/${ideaId}/vote`, { method });

      if (res.ok) {
        const data = await res.json();
        setCount(data.votesCount);
        setVoted(!voted);
        refreshUser();
        globalMutate((key: unknown) => typeof key === "string" && key.startsWith("/api/ideas?"));
        onVoteChange?.(data.votesCount, data.votesBalance);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const isDone = status === "done";
  const disabled = isDone || !user || (!user.isAdmin && user.votesBalance <= 0 && !voted);

  return (
    <button
      onClick={handleVote}
      disabled={disabled || loading}
      title={isDone ? "Идея уже реализована" : !user ? "Войдите, чтобы голосовать" : disabled ? "У вас закончились голоса" : voted ? "Снять голос" : "Проголосовать"}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all ${voted ? "bg-accent/20 text-accent border border-accent/30" : "bg-bg-card border border-border hover:border-accent/30"} ${disabled && !voted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${animating ? "scale-110" : "scale-100"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-transform">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      <span className="text-sm font-bold">{count}</span>
    </button>
  );
}
