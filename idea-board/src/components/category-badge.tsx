import { CATEGORY_LABELS } from "@/lib/constants";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="text-text-secondary text-xs border border-border px-2 py-0.5 rounded-[1000px]">
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}
