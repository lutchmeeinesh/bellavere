import { NextResponse } from "next/server";

/**
 * Unknown /api paths answer with a small JSON 404 instead of the full HTML
 * "page not found". Real routes (/api/contact, /api/auth/login, ...) are more
 * specific, so they always take precedence over this catch-all.
 */
function notFound() {
  return NextResponse.json(
    { ok: false, error: "Not found" },
    { status: 404 },
  );
}

export const GET = notFound;
export const HEAD = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const OPTIONS = notFound;
