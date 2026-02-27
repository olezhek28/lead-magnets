import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { JWT_SECRET, verifyJwt } from "./jwt";
import type { JwtPayload } from "./jwt";

export type { JwtPayload };
export { verifyJwt };

const ADMIN_TELEGRAM_ID = Number(process.env.ADMIN_TELEGRAM_ID || "0");

export async function createJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function getCurrentUser(): Promise<(JwtPayload & { user: any }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload) return null;

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.userId);
  if (!user) return null;

  return { ...payload, user };
}

export function isAdminTelegramId(telegramId: number): boolean {
  return telegramId === ADMIN_TELEGRAM_ID;
}
