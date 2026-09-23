import { NextResponse } from "next/server";

/**
 * Small helpers shared by the API route handlers: same-origin and JSON
 * guards, defensive body parsing, and a JSON 405 for unsupported methods.
 */

/**
 * True unless the request demonstrably comes from another site's page.
 *
 * Browsers label every request with Sec-Fetch-Site (it cannot be set by
 * scripts), so when present it must be "same-origin". Older browsers send
 * only Origin, whose host must then match Host. Requests with neither header
 * come from non-browser clients, which cannot carry a visitor's cookies, so
 * they are allowed; other checks (validation, rate limits) still apply.
 */
export function isSameOrigin(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite.trim().toLowerCase() === "same-origin";

  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    // Unparseable, including the literal "null" sent by sandboxed pages.
    return false;
  }
}

/** 403 for requests from another site (see isSameOrigin), else null. */
export function requireSameOrigin(request: Request): NextResponse | null {
  if (isSameOrigin(request)) return null;
  return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
}

/**
 * 415 unless the body is declared as JSON, else null. A cross-site page
 * cannot send JSON without a CORS preflight (which fails), so this also stops
 * other sites from posting through their visitors' browsers.
 */
export function requireJson(request: Request): NextResponse | null {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (contentType.startsWith("application/json")) return null;
  return NextResponse.json(
    { ok: false, error: "Unsupported request." },
    { status: 415 },
  );
}

/**
 * The JSON body as a plain object, or null if it is not valid JSON or not an
 * object (arrays, null, strings and numbers are all refused).
 */
export async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** The value if it is a string, else "" (never trust a body field's type). */
export function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * A route handler answering 405 with an Allow header, for the methods a route
 * does not support (instead of Next.js's empty 405):
 *
 *   export const GET = methodNotAllowed();
 *   export const DELETE = methodNotAllowed();
 */
export function methodNotAllowed(allow = "POST") {
  return function notAllowed() {
    return NextResponse.json(
      { ok: false, error: "Method not allowed." },
      { status: 405, headers: { Allow: allow } },
    );
  };
}
