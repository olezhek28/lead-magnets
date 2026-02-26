import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createJwt, isAdminTelegramId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Токен не указан" }, { status: 400 });
  }

  const db = getDb();
  const authToken = db.prepare(
    "SELECT * FROM auth_tokens WHERE token = ? AND expires_at > datetime('now')"
  ).get(token) as any;

  if (!authToken) {
    return NextResponse.json({ error: "Токен не найден или истёк" }, { status: 404 });
  }

  if (!authToken.confirmed) {
    return NextResponse.json({ confirmed: false });
  }

  const user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(authToken.telegram_id) as any;
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 500 });
  }

  const jwt = await createJwt({
    userId: user.id,
    telegramId: user.telegram_id,
    isAdmin: user.is_admin === 1,
  });

  db.prepare("DELETE FROM auth_tokens WHERE token = ?").run(token);

  const response = NextResponse.json({
    confirmed: true,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      photoUrl: user.photo_url,
      votesBalance: user.votes_balance,
      isAdmin: user.is_admin === 1,
    },
  });

  response.cookies.set("auth_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
