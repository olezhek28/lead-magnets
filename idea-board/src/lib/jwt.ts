import { jwtVerify } from "jose";

let _jwtSecret: Uint8Array | null = null;

export function getJwtSecret(): Uint8Array {
  if (!_jwtSecret) {
    const raw = process.env.JWT_SECRET;
    if (!raw && process.env.NODE_ENV === "production") {
      console.error("JWT_SECRET не задан в production — используется дефолтный (НЕБЕЗОПАСНО)");
    }
    _jwtSecret = new TextEncoder().encode(raw || "dev-secret-change-me-in-production-32ch");
  }
  return _jwtSecret;
}

export interface JwtPayload {
  userId: number;
  telegramId: number;
  isAdmin: boolean;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
