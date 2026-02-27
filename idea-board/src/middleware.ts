import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import type { JwtPayload } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const payload = await verifyJwt(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (
    (pathname === "/api/ideas" && request.method === "POST") ||
    pathname.includes("/vote") ||
    pathname.startsWith("/api/admin")
  ) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }
    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Невалидный токен" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/ideas/:path*", "/api/admin/:path*"],
};
