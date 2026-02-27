"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import useSWR from "swr";

interface User {
  id: number;
  username: string | null;
  firstName: string;
  photoUrl: string | null;
  votesBalance: number;
  votesGiven: number;
  ideasThisMonth: number;
  monthlyIdeaLimit: number;
  maxVotes: number;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((data) => data.user ?? null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading: loading, mutate } = useSWR<User | null>("/api/auth/me", fetcher, {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
  });

  const refreshUser = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate(null, { revalidate: false });
  }, [mutate]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
