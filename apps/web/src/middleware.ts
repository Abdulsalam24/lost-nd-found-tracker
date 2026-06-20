import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/items/report",
  "/claims",
  "/admin",
  "/chat",
  "/games/detective",
  "/games/ghost-hunt",
  "/games/trivia",
  "/profile",
];

const ADMIN_PATHS = ["/admin"];

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp;
  if (typeof exp !== "number") return true;
  return Date.now() >= exp * 1000;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const payload = parseJwtPayload(token);

    if (!payload || isTokenExpired(payload)) {
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("access_token");
      return response;
    }

    const isAdmin = ADMIN_PATHS.some((path) => pathname.startsWith(path));
    if (isAdmin && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/items/report",
    "/items/report-lost",
    "/items/report-found",
    "/claims/:path*",
    "/admin/:path*",
    "/chat/:path*",
    "/games/detective",
    "/games/ghost-hunt",
    "/games/trivia",
    "/profile",
  ],
};
