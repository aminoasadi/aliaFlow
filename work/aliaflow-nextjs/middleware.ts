import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "./lib/auth";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname);
  const isProtectedApi =
    (pathname.startsWith("/api/sections/") && request.method !== "GET") ||
    pathname.startsWith("/api/media") ||
    pathname.startsWith("/api/admin");

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/sections/:path*", "/api/media/:path*", "/api/admin/:path*"],
};
