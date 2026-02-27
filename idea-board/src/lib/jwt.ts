import { jwtVerify } from "jose";

const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET обязателен в production");
}

export const JWT_SECRET = new TextEncoder().encode(
  JWT_SECRET_RAW || "dev-secret-change-me-in-production-32ch"
);

export interface JwtPayload {
  userId: number;
  telegramId: number;
  isAdmin: boolean;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
