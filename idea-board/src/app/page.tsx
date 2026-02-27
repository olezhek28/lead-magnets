import { Suspense } from "react";
import { cookies } from "next/headers";
import { IdeasList } from "@/components/ideas-list";
import { Filters } from "@/components/filters";
import { IdeaFormWrapper } from "@/components/idea-form-wrapper";
import { SWRProvider } from "@/components/swr-provider";
import { queryIdeas } from "@/lib/ideas-query";
import { verifyJwt } from "@/lib/auth";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sort = (typeof params.sort === "string" ? params.sort : "") || "popular";
  const category = typeof params.category === "string" ? params.category : null;
  const status = typeof params.status === "string" ? params.status : null;
  const search = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.page) || 1);

  let currentUserId: number | null = null;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    const payload = await verifyJwt(token);
    if (payload) currentUserId = payload.userId;
  }

  const data = queryIdeas({ sort, category, status, search, page, currentUserId });

  // Строим SWR-ключ идентично тому, что строит IdeasList на клиенте
  const swrParams = new URLSearchParams();
  if (sort && sort !== "popular") swrParams.set("sort", sort);
  if (category) swrParams.set("category", category);
  if (status) swrParams.set("status", status);
  if (search) swrParams.set("q", search);
  if (page > 1) swrParams.set("page", String(page));
  const swrKey = `/api/ideas?${swrParams.toString()}`;

  return (
    <main className="max-w-[1200px] mx-auto px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Борда идей</h1>
          <p className="text-text-secondary mt-1">
            Предлагай темы для контента и голосуй за то, что хочешь видеть
          </p>
        </div>
        <IdeaFormWrapper />
      </div>

      <div className="bg-bg-card border border-border rounded-[20px] p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-text-secondary">
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none mt-0.5">💡</span>
            <span>Предлагай идеи для видео, постов, курсов и инструментов</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none mt-0.5">👍</span>
            <span>Голосуй за чужие идеи — топовые реализую в первую очередь</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none mt-0.5">🔔</span>
            <span>Следи за статусом — бот уведомит, когда идея будет реализована</span>
          </div>
        </div>
      </div>

      <SWRProvider fallback={{ [swrKey]: data }}>
        <Suspense fallback={null}>
          <Filters />
        </Suspense>

        <div className="mt-6">
          <IdeasList />
        </div>
      </SWRProvider>
    </main>
  );
}
