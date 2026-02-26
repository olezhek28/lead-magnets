import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";

export async function POST() {
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
