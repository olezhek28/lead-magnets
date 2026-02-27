export const CATEGORY_LABELS: Record<string, string> = {
  youtube: "YouTube",
  telegram: "Telegram",
  course: "Курс",
  tool: "Инструмент",
};

export const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS);

export const MAX_VOTES = Number(process.env.MAX_VOTES || 10);
export const REGEN_INTERVAL_HOURS = Number(process.env.REGEN_INTERVAL_HOURS || 24);
export const MONTHLY_IDEA_LIMIT = Number(process.env.MONTHLY_IDEA_LIMIT || 3);
