import { NextResponse } from "next/server";
import { verifyCredentials, SESSION_COOKIE, VIEW_AS_COOKIE } from "@/lib/auth";
import { signSession } from "@/lib/session";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const HOUR = 60 * 60;

export async function POST(request: Request) {
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

  let body: { email?: string; password?: string; remember?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const result = verifyCredentials(body.email ?? "", body.password ?? "");
  if (!result) {
    rateLimit(limitKey, LIMIT);
    return NextResponse.json(
      { ok: false, error: "That email and password don't match our records." },
      { status: 401 }
    );
  }

  // Owners: 12 hours, or 30 days with "Remember me".
  // Admins: 12 hours, or 7 days with "Remember me" — they see everything.
  const lifetime = body.remember
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
    ...(body.remember ? { maxAge: lifetime } : {}),
  });
  response.cookies.set(VIEW_AS_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
