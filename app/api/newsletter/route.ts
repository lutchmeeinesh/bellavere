import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

/**
 * Newsletter signup endpoint (demo).
 *
 * ── Where to plug in a real mailing-list provider ──────────────────────────
 * Replace the `console.log` below with one of:
 *
 *  1. Resend Audiences — `npm i resend`, then:
 *       const resend = new Resend(process.env.RESEND_API_KEY);
 *       await resend.contacts.create({
 *         email,
 *         audienceId: process.env.RESEND_AUDIENCE_ID!,
 *         unsubscribed: false,
 *       });
 *  2. Mailchimp — POST to
 *       https://<dc>.api.mailchimp.com/3.0/lists/<list-id>/members
 *     with { email_address: email, status: "pending" } (double opt-in) and
 *     basic auth using MAILCHIMP_API_KEY.
 *
 * Prefer double opt-in, and keep the signup timestamp as a consent record.
 * ───────────────────────────────────────────────────────────────────────────
 */

type NewsletterSignup = {
  email?: string;
  /** Honeypot — hidden from humans; any value means a bot filled it in. */
  company_website?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`newsletter:${ip}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many attempts. Please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  let body: NewsletterSignup;
  try {
    body = (await request.json()) as NewsletterSignup;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot filled: pretend success and log nothing.
  if (typeof body.company_website === "string" && body.company_website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = body.email?.trim() ?? "";
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  // Demo: log server-side so signups are visible in the terminal.
  console.log("[newsletter] New signup:", {
    email,
    subscribedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
