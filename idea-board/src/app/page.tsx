import { Suspense } from "react";
import { IdeasList } from "@/components/ideas-list";
import { Filters } from "@/components/filters";
import { IdeaFormWrapper } from "@/components/idea-form-wrapper";

export default function Home() {
  return (
    <main className="max-w-[1200px] mx-auto px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Борда идей</h1>
          <p className="text-text-secondary mt-1">
            Предлагай темы для контента и голосуй за то, что хочешь видеть
          </p>
        </div>
        <IdeaFormWrapper />
      </div>

      <Suspense fallback={null}>
        <Filters />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-bg-card border border-border rounded-[20px] p-5 h-32 animate-pulse" />
            ))}
          </div>
        }>
          <IdeasList />
        </Suspense>
      </div>
    </main>
  );
}
