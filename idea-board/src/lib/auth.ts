import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me-in-production-32ch"
);

const ADMIN_TELEGRAM_ID = Number(process.env.ADMIN_TELEGRAM_ID || "0");

export interface JwtPayload {
  userId: number;
  telegramId: number;
  isAdmin: boolean;
}

export async function createJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
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
