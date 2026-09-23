import { NextResponse } from "next/server";
import { verifyCredentials, SESSION_COOKIE, VIEW_AS_COOKIE } from "@/lib/auth";
import { signSession } from "@/lib/session";
import {
  methodNotAllowed,
  readJsonObject,
  requireJson,
  requireSameOrigin,
  str,
} from "@/lib/http";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const HOUR = 60 * 60;

export async function POST(request: Request) {
  // Same-site JSON only (see lib/http.ts). Without this, a cross-site
  // text/plain form post could sign a visitor into an account of the
  // attacker's choosing (login CSRF).
  const refused = requireJson(request) ?? requireSameOrigin(request);
  if (refused) return refused;

  // Slow down password guessing: after 10 FAILED attempts from one IP within
  // 15 minutes, further attempts are refused. Successful sign-ins don't count.
  const limitKey = `login:${getClientIp(request)}`;
  const LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };
  const limit = rateLimit(limitKey, { ...LIMIT, consume: false });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many sign-in attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Missing or empty fields are not a guess: refused before any password
  // check, and not counted towards the lockout.
  const email = str(body.email);
  const password = str(body.password);
  if (!email.trim() || !password) {
    return NextResponse.json(
      { ok: false, error: "Enter your email and password." },
      { status: 400 }
    );
  }
  const remember = body.remember === true;

  const result = verifyCredentials(email, password);
  if (!result) {
    rateLimit(limitKey, LIMIT);
    return NextResponse.json(
      { ok: false, error: "That email and password don't match our records." },
      { status: 401 }
    );
  }

  // Owners: 12 hours, or 30 days with "Remember me".
  // Admins: 12 hours, or 7 days with "Remember me" — they see everything.
  const lifetime = remember
    ? result.role === "admin"
      ? 7 * 24 * HOUR
      : 30 * 24 * HOUR
    : 12 * HOUR;

  let token: string;
  try {
    token = await signSession({
      sub: result.id,
      role: result.role,
      exp: Math.floor(Date.now() / 1000) + lifetime,
    });
  } catch (error) {
    console.error("[auth] cannot sign session:", error);
    return NextResponse.json(
      { ok: false, error: "Sign-in is temporarily unavailable." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    redirect: result.role === "admin" ? "/admin" : "/dashboard",
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: lifetime } : {}),
  });
  response.cookies.set(VIEW_AS_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

// Anything but POST: a JSON 405 with "Allow: POST".
export const GET = methodNotAllowed();
export const PUT = methodNotAllowed();
export const PATCH = methodNotAllowed();
export const DELETE = methodNotAllowed();
