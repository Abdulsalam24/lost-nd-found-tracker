import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/items/report-lost",
  "/items/report-found",
  "/claims",
  "/admin",
  "/chat",
  "/games/detective",
  "/games/ghost-hunt",
  "/games/trivia",
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  if (isAdmin && token) {
    const payload = parseJwtPayload(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/items/report-lost",
    "/items/report-found",
    "/claims/:path*",
    "/admin/:path*",
    "/chat/:path*",
    "/games/detective",
    "/games/ghost-hunt",
    "/games/trivia",
  ],
};
