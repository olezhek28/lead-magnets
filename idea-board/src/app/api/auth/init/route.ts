import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`auth-init:${ip}`, 10, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Слишком много запросов, подождите минуту" }, { status: 429 });
  }

  const db = getDb();
  const token = uuidv4();
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "idea_board_bot";

  db.prepare(
    "INSERT INTO auth_tokens (token, expires_at) VALUES (?, datetime('now', '+5 minutes'))"
  ).run(token);

  db.prepare("DELETE FROM auth_tokens WHERE expires_at < datetime('now')").run();

  const deepLink = `https://t.me/${botUsername}?start=auth_${token}`;

  return NextResponse.json({ token, deepLink });
}
