import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

/**
 * Contact enquiry endpoint (demo).
 *
 * ── Where to plug in a real delivery channel later ─────────────────────────
 * This handler currently just logs the enquiry server-side. To go live, keep
 * the validation below and replace the `console.log` with one (or more) of:
 *
 *  1. Resend  — `npm i resend`, then:
 *       const resend = new Resend(process.env.RESEND_API_KEY);
 *       await resend.emails.send({ from, to: company.email, subject, text });
 *  2. Formspree — forward the payload:
 *       await fetch("https://formspree.io/f/<form-id>", { method: "POST", ... });
 *  3. CRM (HubSpot / Pipedrive / …) — create a lead/contact via their API with
 *     `enquiry` as the payload, ideally in a queued background job.
 *
 * Rate limiting (lib/rateLimit.ts — in-memory, swap for Upstash in
 * production) and a honeypot field are in place. Still recommended:
 * persisting enquiries (with the consent record below) to a database so
 * nothing is lost if delivery fails.
 * ───────────────────────────────────────────────────────────────────────────
 */

type ContactEnquiry = {
  name?: string;
  email?: string;
  phone?: string;
  propertyType?: string;
  propertyCount?: string;
  message?: string;
  consent?: boolean;
  /** Honeypot — hidden from humans; any value means a bot filled it in. */
  company_website?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/** Short, non-reversible IP fingerprint for the consent record. */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 12);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`contact:${ip}`, RATE_LIMIT);
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "You’ve sent several messages in a short time. Please wait a few minutes and try again, or email us directly.",
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  let body: ContactEnquiry;
  try {
    body = (await request.json()) as ContactEnquiry;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot filled: pretend success and log nothing, so bots aren't tipped off.
  if (typeof body.company_website === "string" && body.company_website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !EMAIL_PATTERN.test(email) || !message || body.consent !== true) {
    return NextResponse.json(
      { ok: false, error: "Please complete the required fields." },
      { status: 400 }
    );
  }

  const receivedAt = new Date().toISOString();

  const enquiry = {
    receivedAt,
    name,
    email,
    phone: body.phone?.trim() || null,
    propertyType: body.propertyType || null,
    propertyCount: body.propertyCount || null,
    message,
  };

  // Consent trail (see the privacy policy): what was agreed, when, and a
  // truncated hash of the IP rather than the raw address.
  const consentRecord = {
    consent: body.consent,
    consentText: "I agree to be contacted about my enquiry",
    timestamp: receivedAt,
    ipHash: hashIp(ip),
  };

  // Demo: log server-side so enquiries are visible in the terminal.
  console.log("[contact] New enquiry:", enquiry);
  console.log("[contact] Consent record:", consentRecord);

  return NextResponse.json({ ok: true });
}
