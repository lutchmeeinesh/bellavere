import { NextRequest, NextResponse } from "next/server";
import { clients } from "@/data/clients";

const SESSION_COOKIE = "bv_session";

/**
 * Route protection: unauthenticated visits to /dashboard/* bounce to /login;
 * authenticated visits to /login bounce to /dashboard.
 */
export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const isValidSession = Boolean(
    sessionId && clients.some((c) => c.id === sessionId)
  );
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !isValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    if (sessionId) {
      // Stale or forged cookie — clear it.
      response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    }
    return response;
  }

  if (pathname === "/login" && isValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
