import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { company } from "@/data/company";
import { routing, type AppLocale } from "@/i18n/routing";
import { localeHref } from "@/lib/i18n/paths";

/**
 * Any public URL that matches no page (/no-such-page, /fr/no-such-page,
 * /services/x): the localized 404 page ("Lost at sea?") with a real 404
 * status, complete in the server HTML (it works without JavaScript).
 *
 * Why a route handler and not a page calling notFound(): in Next.js 15 a
 * notFound() thrown while rendering a page makes the server send an empty
 * HTML shell (<html id="__next_error__">) with the 404 status, and the
 * browser then draws the not-found page from the page data, so without
 * JavaScript the page is blank. A page that renders the 404 content itself
 * cannot set the status, and a middleware rewrite with a 404 status makes
 * Vercel serve its own site-wide 404 (app/not-found.tsx, English only).
 *
 * So this handler fetches the static 404 page of the URL's language
 * (app/[locale]/page-not-found, prerendered and edge-cached) and returns its
 * HTML here, at the unknown URL, with status 404. Pages always take
 * precedence over this catch-all, so new public pages need nothing here.
 * If that fetch fails or takes longer than FETCH_TIMEOUT_MS (e.g. a
 * password-protected preview deployment), a plain localized 404 is returned
 * instead.
 *
 * Every method answers 404 (a form posted to an unknown URL included), so an
 * unknown address never looks like a resource that exists (a 405, or a 204
 * listing its methods in answer to OPTIONS).
 */

type Params = { params: Promise<{ locale: string; rest: string[] }> };

/** Marks this handler's own request for the 404 page, so it can never loop. */
const INTERNAL_HEADER = "x-bellavere-not-found";

/**
 * How long to wait for the static 404 page before answering with the plain
 * one. It is prerendered and served from the edge cache, so it normally
 * arrives in a few milliseconds.
 */
const FETCH_TIMEOUT_MS = 3000;

// i18n-ignore-start (HTTP header values, not text)
const HEADERS = {
  "content-type": "text/html; charset=utf-8",
  // Like Next.js's own error responses: never cached.
  "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
  "x-robots-tag": "noindex",
};
// i18n-ignore-end

export const dynamic = "force-dynamic";

async function localeOf(params: Params["params"]): Promise<AppLocale> {
  const { locale } = await params;
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

/**
 * The static 404 page's HTML in a language, or null if it can't be fetched.
 * Fetched from this deployment's own origin: request.url is built from the
 * server's own host and port under `next start` and from the routed domain
 * on Vercel, never from a Host header a visitor could choose.
 */
async function notFoundPage(request: Request, locale: AppLocale): Promise<string | null> {
  if (request.headers.has(INTERNAL_HEADER)) return null;
  try {
    const cookie = request.headers.get("cookie");
    const page = await fetch(new URL(localeHref(locale, "/page-not-found"), request.url), {
      headers: {
        [INTERNAL_HEADER]: "1",
        accept: "text/html",
        // Lets a deployment protected by Vercel Authentication answer too.
        ...(cookie ? { cookie } : {}),
      },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const isHtml = page.headers.get("content-type")?.includes("text/html");
    return page.status === 200 && isHtml ? await page.text() : null;
  } catch {
    return null;
  }
}

const escape = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** A plain 404 page in the URL's language, for when the styled one can't be fetched. */
async function fallbackPage(locale: AppLocale): Promise<string> {
  const t = await getTranslations({ locale, namespace: "common.notFound" });
  return [
    `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<meta name="robots" content="noindex, nofollow">`,
    `<title>${escape(t("title"))} · ${company.name}</title></head>`,
    `<body style="font-family:system-ui,sans-serif;text-align:center;padding:96px 20px">`,
    `<h1>${escape(t("heading"))}</h1><p>${escape(t("body"))}</p>`,
    `<p><a href="${localeHref(locale, "/")}">${escape(t("home"))}</a> · `,
    `<a href="${localeHref(locale, "/contact")}">${escape(t("contact"))}</a></p>`,
    `</body></html>`,
  ].join("");
}

/** The localized 404 page, for every method that can carry a page back. */
async function notFound(request: Request, { params }: Params) {
  const locale = await localeOf(params);
  const html = (await notFoundPage(request, locale)) ?? (await fallbackPage(locale));
  return new Response(html, { status: 404, headers: HEADERS });
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;

/** Same status and headers, no body. */
async function notFoundHead(_request: Request, { params }: Params) {
  await localeOf(params);
  return new Response(null, { status: 404, headers: HEADERS });
}

export const HEAD = notFoundHead;
// Without this export Next.js would answer OPTIONS itself (204, with an
// Allow header), as if the address existed.
export const OPTIONS = notFoundHead;
