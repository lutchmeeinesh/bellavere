import { NextRequest, NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import createIntlMiddleware from "next-intl/middleware";
import { clients } from "@/data/clients";
import { admins } from "@/data/admins";
import { properties } from "@/data/properties";
import { routing, type AppLocale } from "@/i18n/routing";
import { LOCALE_COOKIE } from "@/lib/i18n/localeCookie";
import { localeHref } from "@/lib/i18n/paths";
import {
  SESSION_COOKIE,
  VIEW_AS_COOKIE,
  isDemoMode,
  verifySession,
} from "@/lib/session";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Two kinds of path go through here:
 *
 *  - the owner portal (/login, /dashboard/**, /admin/**): English-only,
 *    never localized, handled by portalMiddleware() below exactly as before
 *    Wave 1 (route protection and the portal's real 404s);
 *  - every other page: the public site, in English (/services) or French
 *    (/fr/services), handled by next-intl (i18n/routing.ts), which maps
 *    unprefixed English URLs onto app/[locale] with locale "en". Before
 *    that, the visitor's language choice (NEXT_LOCALE cookie) sends an
 *    unprefixed URL to its French version. Explicit /fr URLs are never
 *    redirected away, and there is no Accept-Language detection. A prefix
 *    typed in capitals (/FR/services, /En) goes to the lower-case address
 *    (/fr/services, /) in one redirect, before the cookie is looked at.
 *
 * The API, Next.js and Vercel internals and files with an extension
 * (/robots.txt, /sitemap.xml, /icon.svg, /images/...) skip it (see config).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPortalPath(pathname)) return portalMiddleware(request);

  const prefix = localePrefixOf(pathname);
  if (prefix) {
    // The portal has no French version: /fr/login -> /login.
    const rest = pathname.slice(prefix.length + 1) || "/";
    if (isPortalPath(rest)) return redirectTo(request, rest);
    // /FR/services -> /fr/services, /EN/services -> /services: the address
    // with the prefix as the site writes it. Otherwise the cookie redirect
    // below would treat "/FR/..." as unprefixed and send it to /fr/FR/...
    if (pathname.split("/")[1] !== prefix) {
      return redirectTo(request, localeHref(prefix, rest));
    }
  } else {
    // Unprefixed public URL: follow the visitor's language choice.
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
    if (
      hasLocale(routing.locales, preferred) &&
      preferred !== routing.defaultLocale
    ) {
      return redirectTo(
        request,
        `/${preferred}${pathname === "/" ? "" : pathname}`,
      );
    }
  }

  return intlMiddleware(request);
}

/** "/login", "/dashboard", "/dashboard/...", "/admin", "/admin/...". */
function isPortalPath(pathname: string): boolean {
  return pathname === "/login" || /^\/(dashboard|admin)(\/|$)/.test(pathname);
}

/**
 * The locale a path starts with, in any case ("/fr/services" and
 * "/FR/services" -> "fr"), if any. next-intl matches prefixes the same way.
 */
function localePrefixOf(pathname: string): AppLocale | undefined {
  const first = pathname.split("/")[1]?.toLowerCase();
  return routing.locales.find((locale) => locale === first);
}

/** Temporary redirect to another path, keeping the query string. */
function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

/**
 * The pages that exist under app/(portal)/dashboard (plus the property
 * detail page below). The admin area has two: /admin and /admin/clients/[id]. Any other
 * path in either area gets the portal's own 404 (see below), so list new
 * pages here.
 */
const DASHBOARD_PAGES = new Set([
  "/dashboard",
  "/dashboard/bookings",
  "/dashboard/documents",
  "/dashboard/maintenance",
  "/dashboard/properties",
  "/dashboard/settings",
  "/dashboard/statements",
]);
const PROPERTY_PAGE = /^\/dashboard\/properties\/([^/]+)$/;
const ADMIN_CLIENT_PAGE = /^\/admin\/clients\/([^/]+)$/;

/** Caught by app/(portal)/dashboard/[...missing]/page.tsx: the portal's 404 page. */
const DASHBOARD_NOT_FOUND = "/dashboard/__missing";
/** An id no owner has: app/(portal)/admin/clients/[id] answers with the admin 404. */
const ADMIN_NOT_FOUND = "/admin/clients/__missing";

/**
 * Route protection, using the signed session cookie:
 *  - /admin/*      admins only (owners are sent to their dashboard)
 *  - /dashboard/*  owners, or admins who chose an owner to view
 *  - /login        signed-in users are sent to their home page
 * Also answers unknown pages and other owners' properties with a real 404
 * (see below).
 */
async function portalMiddleware(request: NextRequest) {
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

  // The portals stream (dashboard/loading.tsx), so once rendering starts the
  // status can no longer change: an in-page notFound() only swaps the UI and
  // still answers 200. The 404 status is therefore set here, before
  // rendering, on a rewrite to a page that shows the portal's own 404 inside
  // its layout (under `next start`; on Vercel a 404 status makes the platform
  // serve the site-wide 404 page instead). Unknown ids and other owners' ids
  // get the very same response, so it never tells an owner whether another
  // owner's property exists.
  const notFoundIn = (path: string) =>
    NextResponse.rewrite(new URL(path + request.nextUrl.search, request.url), {
      status: 404,
    });

  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      if (ownerId) return NextResponse.redirect(new URL("/dashboard", request.url));
      return toLogin();
    }
    const clientMatch = pathname.match(ADMIN_CLIENT_PAGE);
    const isAdminPage = clientMatch
      ? clients.some((c) => c.id === clientMatch[1])
      : pathname === "/admin";
    return isAdminPage ? NextResponse.next() : notFoundIn(ADMIN_NOT_FOUND);
  }

  if (pathname.startsWith("/dashboard")) {
    if (!ownerId && !isAdmin) return toLogin();
    if (!viewedClientId) {
      // An admin who hasn't picked an owner starts from the admin overview.
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Property ownership is checked against the owner being viewed. The
    // property page repeats the check as defence in depth.
    const propertyMatch = pathname.match(PROPERTY_PAGE);
    const isDashboardPage = propertyMatch
      ? properties.some(
          (p) => p.id === propertyMatch[1] && p.clientId === viewedClientId
        )
      : DASHBOARD_PAGES.has(pathname);
    return isDashboardPage ? NextResponse.next() : notFoundIn(DASHBOARD_NOT_FOUND);
  }

  if (pathname === "/login") {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    if (ownerId) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // The portal, exactly as before Wave 1 (including paths with a dot).
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    // Public pages: everything except the API, Next.js and Vercel
    // internals, and files with an extension.
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
