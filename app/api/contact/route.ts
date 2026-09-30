import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { company } from "@/data/company";
import {
  methodNotAllowed,
  readJsonObject,
  requireJson,
  requireSameOrigin,
  str,
} from "@/lib/http";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { CONTACT_LIMITS, EMAIL_PATTERN } from "@/lib/contactLimits";

/**
 * Contact enquiry endpoint.
 *
 * Validates the form, then emails the enquiry to Bellavere via Resend
 * (https://resend.com), with Reply-To set to the enquirer so answering is
 * one click. Configuration (environment variables):
 *
 *   RESEND_API_KEY      required in production; without it the form reports
 *                       an error (with direct contacts) instead of silently
 *                       dropping enquiries. In development the enquiry is
 *                       only logged.
 *   CONTACT_TO_EMAIL    recipient; defaults to company.email
 *                       (BellavereLtd@gmail.com).
 *   CONTACT_FROM_EMAIL  sender; defaults to Resend's shared test sender,
 *                       which can only deliver to the email address the
 *                       Resend account was created with. Once a domain is
 *                       verified in Resend, set e.g.
 *                       "Bellavere website <website@bellaveremu.com>".
 *   RESEND_API_URL      override for tests only.
 *
 * Same-site JSON only (lib/http.ts), rate limiting (lib/rateLimit.ts —
 * in-memory, swap for Upstash at scale) and a honeypot field are in place. If delivery fails, the visitor is
 * shown the direct email and phone numbers (the real safeguard) and the
 * enquiry is written to the runtime log — a short-term net only: Vercel keeps
 * runtime logs for about 1 hour on Hobby and 1 day on Pro.
 */

type Enquiry = {
  receivedAt: string;
  name: string;
  email: string;
  phone: string | null;
  propertyType: string | null;
  propertyCount: string | null;
  message: string;
};

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

const CONSENT_TEXT =
  "I agree to be contacted about my enquiry, as described in the privacy policy";

/** Offered whenever an enquiry cannot be delivered, so no lead is lost. */
const DIRECT_CONTACT = `Please email ${company.email} or call ${company.contacts
  .map((person) => `${person.name.split(" ")[0]} on ${person.phone}`)
  .join(" or ")} — we answer the same day.`;

/** Short, non-reversible IP fingerprint for the consent record. */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 12);
}

/** Single line, no control characters (safe for subjects and headers). */
function oneLine(value: string): string {
  // Deliberately strips control characters (the lint rule is off in this config).
  return value.replace(/[\x00-\x1f\x7f]+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailContent(enquiry: Enquiry, consentAt: string) {
  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone ?? "—"],
    ["Property type", enquiry.propertyType ?? "—"],
    ["Number of properties", enquiry.propertyCount ?? "—"],
  ];
  const text = [
    "New enquiry from the Bellavere website",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    enquiry.message,
    "",
    `Consent: agreed to be contacted (${consentAt}).`,
    "Reply to this email to answer the enquirer directly.",
  ].join("\n");
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1c1c1c;line-height:1.5">
  <p style="font-size:16px;margin:0 0 12px"><strong>New enquiry from the Bellavere website</strong></p>
  <table style="border-collapse:collapse;margin-bottom:16px">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#666">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("")}</table>
  <p style="margin:0 0 4px;color:#666">Message</p>
  <p style="margin:0 0 16px;white-space:pre-wrap">${escapeHtml(enquiry.message)}</p>
  <p style="margin:0;color:#666;font-size:12px">Consent: agreed to be contacted (${escapeHtml(consentAt)}). Reply to this email to answer the enquirer directly.</p>
</div>`;
  return { text, html };
}

/** Sends the enquiry by email. Returns false if it was only logged (dev). */
async function deliver(enquiry: Enquiry, consentAt: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    console.log(
      "[contact] RESEND_API_KEY not set (development) — enquiry logged only:",
      enquiry,
    );
    return false;
  }

  const { text, html } = emailContent(enquiry, consentAt);
  const response = await fetch(
    process.env.RESEND_API_URL || "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.CONTACT_FROM_EMAIL ||
          "Bellavere website <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL || company.email],
        reply_to: enquiry.email,
        subject: oneLine(`New enquiry from ${enquiry.name}`).slice(0, 150),
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`Resend responded ${response.status}: ${detail}`);
  }
  return true;
}

export async function POST(request: Request) {
  // Only same-site JSON requests (see lib/http.ts): stops other sites from
  // posting through their visitors' browsers and using up the daily email
  // quota.
  const refused = requireJson(request) ?? requireSameOrigin(request);
  if (refused) return refused;

  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Honeypot (hp_extra, hidden from humans) filled: pretend success so bots
  // aren't tipped off, but leave a one-line trace in case a real visitor's
  // browser ever fills it.
  if (str(body.hp_extra).trim()) {
    console.warn("[contact] Honeypot hit", {
      email: str(body.email).slice(0, 254) || null,
    });
    return NextResponse.json({ ok: true });
  }

  // Every field is read through str(): a number, object or array where text
  // is expected counts as missing, so odd payloads get a 400, never a 500.
  const name = oneLine(str(body.name));
  const email = oneLine(str(body.email));
  const phone = oneLine(str(body.phone));
  const propertyType = oneLine(str(body.propertyType));
  const propertyCount = oneLine(str(body.propertyCount));
  const message = str(body.message).trim();

  const tooLong =
    name.length > CONTACT_LIMITS.name ||
    email.length > CONTACT_LIMITS.email ||
    phone.length > CONTACT_LIMITS.phone ||
    propertyType.length > CONTACT_LIMITS.choice ||
    propertyCount.length > CONTACT_LIMITS.choice ||
    message.length > CONTACT_LIMITS.message;

  if (tooLong) {
    return NextResponse.json(
      {
        ok: false,
        error: `Part of your message is too long — please shorten it (messages up to ${CONTACT_LIMITS.message.toLocaleString("en-GB")} characters). ${DIRECT_CONTACT}`,
      },
      { status: 400 },
    );
  }

  if (
    !name ||
    !EMAIL_PATTERN.test(email) ||
    !message ||
    body.consent !== true
  ) {
    return NextResponse.json(
      { ok: false, error: "Please complete the required fields." },
      { status: 400 },
    );
  }

  // Counted only now, for enquiries that would really be emailed: refused,
  // invalid and honeypot requests never use up a visitor's allowance.
  const ip = getClientIp(request);
  const limited = rateLimit(`contact:${ip}`, RATE_LIMIT);
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `You’ve sent several messages in a short time. Please wait a few minutes and try again. ${DIRECT_CONTACT}`,
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const receivedAt = new Date().toISOString();
  const enquiry: Enquiry = {
    receivedAt,
    name,
    email,
    phone: phone || null,
    propertyType: propertyType || null,
    propertyCount: propertyCount || null,
    message,
  };

  // Consent trail (see the privacy policy): what was agreed, when, and a
  // truncated hash of the IP rather than the raw address.
  const consentRecord = {
    consent: true,
    consentText: CONSENT_TEXT,
    timestamp: receivedAt,
    ipHash: hashIp(ip),
  };
  console.log("[contact] Consent record:", consentRecord);

  try {
    await deliver(enquiry, receivedAt);
  } catch (error) {
    // Short-term record in the runtime log (kept ~1 h on Hobby, 1 day on Pro).
    console.error("[contact] Delivery failed:", error, "Enquiry:", enquiry);
    return NextResponse.json(
      {
        ok: false,
        error: `We couldn’t send your message just now. ${DIRECT_CONTACT}`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

// Anything but POST: a JSON 405 with "Allow: POST".
export const GET = methodNotAllowed();
export const PUT = methodNotAllowed();
export const PATCH = methodNotAllowed();
export const DELETE = methodNotAllowed();
