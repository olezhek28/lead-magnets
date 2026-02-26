"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./auth-provider";

export function TelegramAuth() {
  const { refreshUser } = useAuth();
  const [state, setState] = useState<"idle" | "waiting" | "success" | "error">("idle");
  const [deepLink, setDeepLink] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAuth = async () => {
    try {
      const res = await fetch("/api/auth/init", { method: "POST" });
      const data = await res.json();
      setDeepLink(data.deepLink);
      setState("waiting");

      window.open(data.deepLink, "_blank");

      pollingRef.current = setInterval(async () => {
        try {
          const checkRes = await fetch(`/api/auth/check?token=${data.token}`);
          const checkData = await checkRes.json();

          if (checkData.confirmed) {
            clearInterval(pollingRef.current!);
            clearTimeout(timeoutRef.current!);
            setState("success");
            await refreshUser();
          }
        } catch {}
      }, 2000);

      timeoutRef.current = setTimeout(() => {
        clearInterval(pollingRef.current!);
        setState("error");
      }, 120000);
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (state === "waiting") {
    return (
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-text-secondary">
          <p>Перейди в Telegram и нажми &quot;Start&quot;</p>
          <a href={deepLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs">
            Открыть бота повторно
          </a>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-red-400">Время истекло</p>
        <button
          onClick={() => { setState("idle"); startAuth(); }}
          className="text-accent text-sm hover:underline"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startAuth}
      className="flex items-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white px-4 py-2 rounded-[1000px] text-sm font-semibold transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
      Войти через Telegram
    </button>
  );
}
