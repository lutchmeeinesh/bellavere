import { NextResponse } from "next/server";
import { getAdmin, VIEW_AS_COOKIE } from "@/lib/auth";
import { getClientById } from "@/data/clients";

/**
 * Admin-only: open an owner's portal (clientId set) or return to the admin
 * overview (clientId empty). Called by plain HTML forms; the session cookie
 * is SameSite=Lax, so cross-site form posts arrive without it and are refused.
 */
export async function POST(request: Request) {
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
