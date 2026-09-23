import { NextResponse } from "next/server";
import { SESSION_COOKIE, VIEW_AS_COOKIE } from "@/lib/session";
import { methodNotAllowed, requireSameOrigin } from "@/lib/http";

/**
 * Signs out. Posted by plain HTML forms (sidebar, mobile menu, admin header),
 * which browsers mark as same-origin; a post from another site is refused
 * and the cookies are left alone, so no page elsewhere can sign people out.
 */
export async function POST(request: Request) {
  const refused = requireSameOrigin(request);
  if (refused) return refused;

  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(VIEW_AS_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

// Anything but POST: a JSON 405 with "Allow: POST".
export const GET = methodNotAllowed();
export const PUT = methodNotAllowed();
export const PATCH = methodNotAllowed();
export const DELETE = methodNotAllowed();
