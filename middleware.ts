import { NextRequest, NextResponse } from "next/server";
import { clients } from "@/data/clients";
import { admins } from "@/data/admins";
import { properties } from "@/data/properties";
import {
  SESSION_COOKIE,
  VIEW_AS_COOKIE,
  isDemoMode,
  verifySession,
} from "@/lib/session";

/**
 * Route protection, using the signed session cookie:
 *  - /admin/*      admins only (owners are sent to their dashboard)
 *  - /dashboard/*  owners, or admins who chose an owner to view
 *  - /login        signed-in users are sent to their home page
 * Also enforces property ownership with a real 404 (see below).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawSession = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(rawSession);

  const ownerId =
    session?.role === "owner" &&
    isDemoMode() &&
    clients.some((c) => c.id === session.sub)
      ? session.sub
      : null;
  const isAdmin =
    session?.role === "admin" && admins.some((a) => a.id === session.sub);
  const viewAs = isAdmin ? request.cookies.get(VIEW_AS_COOKIE)?.value : undefined;
  const viewedClientId =
    ownerId ?? (viewAs && clients.some((c) => c.id === viewAs) ? viewAs : null);

  const toLogin = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    // A cookie that fails verification (forged, expired, stale) is cleared.
    if (rawSession && !ownerId && !isAdmin) {
      response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    }
    return response;
  };

  if (pathname.startsWith("/admin")) {
    if (isAdmin) return NextResponse.next();
    if (ownerId) return NextResponse.redirect(new URL("/dashboard", request.url));
    return toLogin();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!ownerId && !isAdmin) return toLogin();
    if (!viewedClientId) {
      // An admin who hasn't picked an owner starts from the admin overview.
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Data isolation with a real HTTP 404: the dashboard streams
    // (loading.tsx), so an in-page notFound() can no longer change the status
    // code — ownership of /dashboard/properties/[id] is enforced here, before
    // rendering starts. The page repeats the check as defence in depth.
    const propertyMatch = pathname.match(/^\/dashboard\/properties\/([^/]+)$/);
    if (propertyMatch) {
      const property = properties.find((p) => p.id === propertyMatch[1]);
      if (!property || property.clientId !== viewedClientId) {
        // An unmatched route renders the branded 404 with a genuine 404 status.
        return NextResponse.rewrite(new URL("/__forbidden-404", request.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    if (ownerId) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
