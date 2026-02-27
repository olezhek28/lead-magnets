"use client";

import { useAuth } from "./auth-provider";
import { TelegramAuth } from "./telegram-auth";

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-base/80 border-b border-border-light">
      <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
        <a href="https://olezhek28.courses" className="text-accent font-bold text-lg sm:text-xl whitespace-nowrap">
          {"{ Олег Козырев }"}
        </a>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-32 h-9 bg-bg-card rounded-[1000px] animate-pulse" />
          ) : user ? (
            <>
              <div className="flex items-center gap-1.5 bg-bg-card px-3 py-1.5 rounded-[1000px] text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <span className="text-text-secondary">{user.votesBalance}/{user.maxVotes || 10}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary hidden sm:inline">
                  {user.firstName}
                </span>
                {user.isAdmin && (
                  <a href="/admin" className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-[1000px]">
                    Админ
                  </a>
                )}
                <button onClick={logout} className="text-text-secondary hover:text-text-primary text-sm transition-colors">
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <TelegramAuth />
          )}
        </div>
      </div>
    </header>
  );
}
