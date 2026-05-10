import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/items/report-lost",
  "/items/report-found",
  "/claims",
  "/admin",
  "/games/detective",
  "/games/ghost-hunt",
  "/games/trivia",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/items/report-lost",
    "/items/report-found",
    "/claims/:path*",
    "/admin/:path*",
    "/games/detective",
    "/games/ghost-hunt",
    "/games/trivia",
  ],
};
