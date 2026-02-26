const CATEGORY_MAP: Record<string, string> = {
  youtube: "YouTube",
  telegram: "Telegram",
  course: "Курс",
  tool: "Инструмент",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="text-text-secondary text-xs border border-border px-2 py-0.5 rounded-[1000px]">
      {CATEGORY_MAP[category] || category}
    </span>
  );
}
