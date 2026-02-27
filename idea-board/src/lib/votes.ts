import { getDb } from "./db";
import { MAX_VOTES, REGEN_INTERVAL_HOURS, MONTHLY_IDEA_LIMIT } from "./constants";

export { MONTHLY_IDEA_LIMIT };

export function regenerateVotes(userId: number): void {
  const db = getDb();
  const user = db.prepare("SELECT votes_balance, last_vote_regen_at FROM users WHERE id = ?").get(userId) as any;
  if (!user) return;

  const lastRegen = new Date(user.last_vote_regen_at + "Z").getTime();
  const now = Date.now();
  const hoursPassed = (now - lastRegen) / (1000 * 60 * 60);
  const periodsElapsed = Math.floor(hoursPassed / REGEN_INTERVAL_HOURS);

  if (periodsElapsed <= 0) return;

  const newBalance = Math.min(user.votes_balance + periodsElapsed, MAX_VOTES);
  const newRegenTime = new Date(lastRegen + periodsElapsed * REGEN_INTERVAL_HOURS * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .replace("Z", "");

  db.prepare(
    "UPDATE users SET votes_balance = ?, last_vote_regen_at = ? WHERE id = ?"
  ).run(newBalance, newRegenTime, userId);
}

export function resetMonthlyIdeaLimit(userId: number): void {
  const db = getDb();
  const user = db.prepare("SELECT ideas_this_month, ideas_month_reset FROM users WHERE id = ?").get(userId) as any;
  if (!user) return;

  const currentMonth = new Date().toISOString().slice(0, 7);
  if (user.ideas_month_reset !== currentMonth) {
    db.prepare(
      "UPDATE users SET ideas_this_month = 0, ideas_month_reset = ? WHERE id = ?"
    ).run(currentMonth, userId);
  }
}

export function getUserWithBalance(userId: number) {
  regenerateVotes(userId);
  resetMonthlyIdeaLimit(userId);

  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
}
