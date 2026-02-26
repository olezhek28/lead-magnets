import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserWithBalance, MONTHLY_IDEA_LIMIT } from "@/lib/votes";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = getUserWithBalance(session.userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const db = getDb();
  const votesGiven = (db.prepare("SELECT COUNT(*) as c FROM votes WHERE user_id = ?").get(session.userId) as any).c;

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      photoUrl: user.photo_url,
      votesBalance: user.votes_balance,
      votesGiven,
      ideasThisMonth: user.ideas_this_month,
      monthlyIdeaLimit: MONTHLY_IDEA_LIMIT,
      maxVotes: Number(process.env.MAX_VOTES || 10),
      isAdmin: user.is_admin === 1,
      lastVoteRegenAt: user.last_vote_regen_at,
    },
  });
}
