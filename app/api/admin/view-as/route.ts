import { NextResponse } from "next/server";
import { getAdmin, VIEW_AS_COOKIE } from "@/lib/auth";
import { getClientById } from "@/data/clients";
import { methodNotAllowed, requireSameOrigin } from "@/lib/http";

/**
 * Admin-only: open an owner's portal (clientId set) or return to the admin
 * overview (clientId empty). Called by plain HTML forms; the session cookie
 * is SameSite=Lax, so cross-site form posts arrive without it and are refused.
 * Posts from another site are also refused outright (defence in depth, e.g.
 * from a sibling subdomain, which counts as same-site for SameSite cookies).
 */
export async function POST(request: Request) {
  const refused = requireSameOrigin(request);
  if (refused) return refused;

  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const clientId = String(form?.get("clientId") ?? "");
  const client = clientId ? getClientById(clientId) : undefined;

  if (!client) {
    const response = NextResponse.redirect(new URL("/admin", request.url), 303);
    response.cookies.set(VIEW_AS_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  response.cookies.set(VIEW_AS_COOKIE, client.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}

// Anything but POST: a JSON 405 with "Allow: POST".
export const GET = methodNotAllowed();
export const PUT = methodNotAllowed();
export const PATCH = methodNotAllowed();
export const DELETE = methodNotAllowed();
