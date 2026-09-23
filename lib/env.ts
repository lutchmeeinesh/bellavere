import { admins } from "@/data/admins";
import { EMAIL_PATTERN } from "@/lib/contactLimits";

/**
 * Production environment check, run once per server start from
 * instrumentation.ts. Errors are variables the site cannot work without;
 * warnings are likely mistakes. Messages name the variable and the problem,
 * never its value, because they end up in the Vercel logs.
 */

export interface EnvCheck {
  errors: string[];
  warnings: string[];
}

/**
 * The exact format written by lib/password.ts and scripts/hash-password.mjs:
 * "scrypt:<salt>:<hash>", a 16-byte salt and a 64-byte hash, both base64.
 * A hash that was cut short or pasted with quotes fails this check.
 */
const PASSWORD_HASH_PATTERN = /^scrypt:[A-Za-z0-9+/]{22}==:[A-Za-z0-9+/]{86}==$/;

/** Values lib/session.ts and app/robots.ts compare against. */
const BOOLEAN_VALUES = ["true", "false"];

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function checkEnv(env: NodeJS.ProcessEnv = process.env): EnvCheck {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sessionSecret = env.SESSION_SECRET;
  if (!sessionSecret) {
    errors.push("SESSION_SECRET is not set, so no one can sign in.");
  } else if (sessionSecret.length < 32) {
    errors.push(
      "SESSION_SECRET is shorter than 32 characters, so no one can sign in."
    );
  }

  for (const admin of admins) {
    const name = admin.passwordHashEnv;
    const hash = env[name];
    if (!hash) {
      errors.push(`${name} is not set, so that administrator cannot sign in.`);
    } else if (!PASSWORD_HASH_PATTERN.test(hash)) {
      errors.push(
        `${name} is not a password hash from scripts/hash-password.mjs (scrypt:<salt>:<hash>), so that administrator cannot sign in.`
      );
    }
  }

  if (!env.RESEND_API_KEY) {
    errors.push(
      "RESEND_API_KEY is not set, so the contact form cannot send enquiries."
    );
  }

  // Read at build time for metadata, the sitemap and robots.txt: redeploy
  // after changing it.
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    errors.push(
      "NEXT_PUBLIC_SITE_URL is not set, so links in the metadata, sitemap and robots.txt point to localhost."
    );
  } else if (!isHttpsUrl(siteUrl)) {
    errors.push("NEXT_PUBLIC_SITE_URL is not an absolute https:// URL.");
  }

  const demoMode = env.DEMO_MODE;
  if (demoMode !== undefined && !BOOLEAN_VALUES.includes(demoMode)) {
    warnings.push(
      'DEMO_MODE is not "true" or "false"; any value other than "false" keeps the demo owner accounts switched on.'
    );
  }

  const siteIndexable = env.SITE_INDEXABLE;
  if (siteIndexable !== undefined && !BOOLEAN_VALUES.includes(siteIndexable)) {
    warnings.push(
      'SITE_INDEXABLE is not "true" or "false"; any value other than "true" keeps the site out of search results.'
    );
  }

  // An empty value falls back to the company address (app/api/contact).
  const contactTo = env.CONTACT_TO_EMAIL;
  if (contactTo && !EMAIL_PATTERN.test(contactTo)) {
    warnings.push(
      "CONTACT_TO_EMAIL is not a valid email address, so enquiries may not be delivered."
    );
  }

  if (!env.CONTACT_FROM_EMAIL?.trim()) {
    warnings.push(
      "CONTACT_FROM_EMAIL is not set; Resend's test sender only delivers to the Resend account owner's address."
    );
  }

  return { errors, warnings };
}
