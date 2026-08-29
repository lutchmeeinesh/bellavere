import { NextResponse } from "next/server";

/**
 * Contact enquiry endpoint (demo).
 *
 * ── Where to plug in a real delivery channel later ─────────────────────────
 * This handler currently just logs the enquiry server-side. To go live, keep
 * the validation below and replace the `console.log` with one (or more) of:
 *
 *  1. Resend  — `npm i resend`, then:
 *       const resend = new Resend(process.env.RESEND_API_KEY);
 *       await resend.emails.send({ from, to: "hello@bellavere.mu", subject, text });
 *  2. Formspree — forward the payload:
 *       await fetch("https://formspree.io/f/<form-id>", { method: "POST", ... });
 *  3. CRM (HubSpot / Pipedrive / …) — create a lead/contact via their API with
 *     `enquiry` as the payload, ideally in a queued background job.
 *
 * Also consider: rate limiting (e.g. by IP), a honeypot field for spam, and
 * persisting enquiries to a database so nothing is lost if delivery fails.
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
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ContactEnquiry;
  try {
    body = (await request.json()) as ContactEnquiry;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
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

  const enquiry = {
    receivedAt: new Date().toISOString(),
    name,
    email,
    phone: body.phone?.trim() || null,
    propertyType: body.propertyType || null,
    propertyCount: body.propertyCount || null,
    message,
  };

  // Demo: log server-side so enquiries are visible in the terminal.
  console.log("[contact] New enquiry:", enquiry);

  return NextResponse.json({ ok: true });
}
