"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

export function SWRProvider({ fallback, children }: { fallback: Record<string, any>; children: ReactNode }) {
  return <SWRConfig value={{ fallback }}>{children}</SWRConfig>;
}
