import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths exempt from authentication
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/avatar") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/api/proxy")
  ) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has("sop_session");
  const isDemo = request.cookies.has("sop_mode");

  // Redirect to /login if neither session nor demo cookie exists
  if (!hasSession && !isDemo) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, favicon, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
