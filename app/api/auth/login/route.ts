import { NextResponse } from "next/server";
import { verifyCredentials, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; remember?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }

  const client = verifyCredentials(body.email ?? "", body.password ?? "");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "That email and password don't match our records." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, client.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // "Remember me" keeps the session for 30 days; otherwise session cookie.
    ...(body.remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
  return response;
}
