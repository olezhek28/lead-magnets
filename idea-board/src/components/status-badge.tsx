const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-status-new" },
  done: { label: "Реализована", color: "bg-status-done" },
  moderation: { label: "На модерации", color: "bg-status-moderation" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: "bg-gray-500" };
  return (
    <span className={`${s.color} text-white text-xs font-semibold px-2.5 py-0.5 rounded-[1000px]`}>
      {s.label}
    </span>
  );
}
