import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me-in-production-32ch"
);

interface JwtPayload {
  userId: number;
  telegramId: number;
  isAdmin: boolean;
}

async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защита админ-маршрутов
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Защита API создания идей и голосования
  if (
    (pathname === "/api/ideas" && request.method === "POST") ||
    pathname.includes("/vote") ||
    pathname.startsWith("/api/admin")
  ) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Невалидный токен" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/ideas/:path*", "/api/admin/:path*"],
};
