"use client";

import { IdeaForm } from "./idea-form";
import { useRouter } from "next/navigation";

export function IdeaFormWrapper() {
  const router = useRouter();
  return <IdeaForm onCreated={() => router.refresh()} />;
}
