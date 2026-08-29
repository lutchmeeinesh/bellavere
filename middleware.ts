import { NextRequest, NextResponse } from "next/server";
import { clients } from "@/data/clients";
import { properties } from "@/data/properties";

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

  // Data isolation with a real HTTP 404: because the dashboard streams
  // (loading.tsx), an in-page notFound() can no longer change the status
  // code — so ownership of /dashboard/properties/[id] is enforced here,
  // before rendering starts. The page repeats the check as defence in depth.
  const propertyMatch = pathname.match(/^\/dashboard\/properties\/([^/]+)$/);
  if (propertyMatch && isValidSession) {
    const property = properties.find((p) => p.id === propertyMatch[1]);
    if (!property || property.clientId !== sessionId) {
      // Rewriting to an unmatched route renders the branded 404 page with a
      // genuine 404 status.
      return NextResponse.rewrite(new URL("/__forbidden-404", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
