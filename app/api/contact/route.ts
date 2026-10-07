import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createTranslator, hasLocale } from "next-intl";
import { company } from "@/data/company";
import { PUBLIC_EMAIL } from "@/data/site";
import { getAllMessages } from "@/i18n/messages";
import { MESSAGE_FORMATS, routing, type AppLocale } from "@/i18n/routing";
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
 *   CONTACT_TO_EMAIL    recipient; defaults to PUBLIC_EMAIL (data/site.ts,
 *                       BellavereLtd@gmail.com until hello@bellaveremu.com
 *                       has a mailbox).
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
 *
 * Every error answer is { ok: false, code, error }: `code` is a stable
 * ContactErrorCode, which the form (components/contact/ContactForm.tsx)
 * shows in the visitor's language (messages `contact.form.errors.*`, with
 * the direct contacts); `error` stays English text for any other client.
 * The body may carry the page's `locale` ("en" | "fr"; anything else is
 * ignored): the enquiry email shows the enquirer's language, and the
 * consent record holds the consent sentence in the language they saw.
 */

/** Machine-readable reason of every error answer (see above). */
export type ContactErrorCode =
  | "invalid_request"
  | "missing_fields"
  | "too_long"
  | "rate_limited"
  | "delivery_failed"
  | "unsupported"
  | "forbidden"
  | "method_not_allowed";

type Enquiry = {
  receivedAt: string;
  name: string;
  email: string;
  phone: string | null;
  propertyType: string | null;
  propertyCount: string | null;
  message: string;
  /** The language of the page the enquiry was sent from, if known. */
  locale: AppLocale | null;
};

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/** Language names for the team (the enquiry email is always in English). */
const LANGUAGE_NAMES: Record<AppLocale, string> = {
  en: "English",
  fr: "French",
};

/**
 * The consent sentence next to the form's checkbox, as plain text, in the
 * language the visitor saw it in (messages `contact.form.consent`).
 */
function consentText(locale: AppLocale): string {
  const t = createTranslator({
    locale,
    messages: getAllMessages(locale),
    formats: MESSAGE_FORMATS,
    namespace: "contact.form",
  });
  return t.markup("consent", { link: (chunks) => chunks });
}

/** Offered whenever an enquiry cannot be delivered, so no lead is lost. */
const DIRECT_CONTACT = `Please email ${PUBLIC_EMAIL} or call ${company.contacts
  .map((person) => `${person.name.split(" ")[0]} on ${person.phone}`)
  .join(" or ")} — we answer the same day.`;

function errorResponse(
  code: ContactErrorCode,
  error: string,
  init: { status: number; headers?: HeadersInit },
): NextResponse {
  return NextResponse.json({ ok: false, code, error }, init);
}

/**
 * A refusal from the shared helpers in lib/http.ts (also used by the
 * sign-in route) with this route's error code added; status, headers and
 * text unchanged.
 */
async function withCode(
  response: NextResponse,
  code: ContactErrorCode,
): Promise<NextResponse> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return errorResponse(code, body?.error ?? "", {
    status: response.status,
    headers: response.headers,
  });
}

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
    ["Language", enquiry.locale ? LANGUAGE_NAMES[enquiry.locale] : "—"],
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
        to: [process.env.CONTACT_TO_EMAIL || PUBLIC_EMAIL],
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
  const notJson = requireJson(request);
  if (notJson) return withCode(notJson, "unsupported");
  const crossSite = requireSameOrigin(request);
  if (crossSite) return withCode(crossSite, "forbidden");

  const body = await readJsonObject(request);
  if (!body) {
    return errorResponse("invalid_request", "Invalid request body.", {
      status: 400,
    });
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
  // Optional; an unknown value is ignored rather than refused (no lost lead).
  const locale = hasLocale(routing.locales, body.locale) ? body.locale : null;

  const tooLong =
    name.length > CONTACT_LIMITS.name ||
    email.length > CONTACT_LIMITS.email ||
    phone.length > CONTACT_LIMITS.phone ||
    propertyType.length > CONTACT_LIMITS.choice ||
    propertyCount.length > CONTACT_LIMITS.choice ||
    message.length > CONTACT_LIMITS.message;

  if (tooLong) {
    return errorResponse(
      "too_long",
      `Part of your message is too long — please shorten it (messages up to ${CONTACT_LIMITS.message.toLocaleString("en-GB")} characters). ${DIRECT_CONTACT}`,
      { status: 400 },
    );
  }

  if (
    !name ||
    !EMAIL_PATTERN.test(email) ||
    !message ||
    body.consent !== true
  ) {
    return errorResponse(
      "missing_fields",
      "Please complete the required fields.",
      { status: 400 },
    );
  }

  // Counted only now, for enquiries that would really be emailed: refused,
  // invalid and honeypot requests never use up a visitor's allowance.
  const ip = getClientIp(request);
  const limited = rateLimit(`contact:${ip}`, RATE_LIMIT);
  if (!limited.ok) {
    return errorResponse(
      "rate_limited",
      `You’ve sent several messages in a short time. Please wait a few minutes and try again. ${DIRECT_CONTACT}`,
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
    locale,
  };

  // Consent trail (see the privacy policy): what was agreed (in the
  // language shown; English if the client did not say), when, and a
  // truncated hash of the IP rather than the raw address.
  const consentRecord = {
    consent: true,
    consentText: consentText(locale ?? routing.defaultLocale),
    locale,
    timestamp: receivedAt,
    ipHash: hashIp(ip),
  };
  console.log("[contact] Consent record:", consentRecord);

  try {
    await deliver(enquiry, receivedAt);
  } catch (error) {
    // Short-term record in the runtime log (kept ~1 h on Hobby, 1 day on Pro).
    console.error("[contact] Delivery failed:", error, "Enquiry:", enquiry);
    return errorResponse(
      "delivery_failed",
      `We couldn’t send your message just now. ${DIRECT_CONTACT}`,
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

// Anything but POST: a JSON 405 with "Allow: POST" (and its error code).
const notAllowed = methodNotAllowed();
function refuseMethod() {
  return withCode(notAllowed(), "method_not_allowed");
}
export const GET = refuseMethod;
export const PUT = refuseMethod;
export const PATCH = refuseMethod;
export const DELETE = refuseMethod;
