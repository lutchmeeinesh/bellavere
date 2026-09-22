/**
 * Signed session tokens, shared by middleware (edge) and server code.
 *
 * Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature).
 * The signing key is SESSION_SECRET (32+ characters). Without a valid
 * signature a cookie is ignored, so sessions can no longer be forged by
 * editing the cookie. Uses Web Crypto only, which works in both runtimes.
 */

export const SESSION_COOKIE = "bv_session";
/** Admin-only: which owner's portal an administrator is currently viewing. */
export const VIEW_AS_COOKIE = "bv_view_as";

export type Role = "owner" | "admin";

export interface SessionPayload {
  /** Client id (owner) or admin id. */
  sub: string;
  role: Role;
  /** Expiry, seconds since the epoch. */
  exp: number;
}

const DEV_FALLBACK_SECRET = "dev-only-insecure-session-secret-do-not-use-in-prod";
const encoder = new TextEncoder();

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    // Fail closed: no secret means no sessions can be issued or accepted.
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return DEV_FALLBACK_SECRET;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${body}.${await sign(body)}`;
}

/** Returns the payload if the token is authentic and unexpired, else null. */
export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined) return null;
  try {
    if (!safeEqual(signature, await sign(body))) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(body))
    ) as Partial<SessionPayload>;
    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "owner" && payload.role !== "admin") ||
      typeof payload.exp !== "number" ||
      payload.exp * 1000 <= Date.now()
    ) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * The two demo owner accounts (Sophie, Hamilton) only work while DEMO_MODE is
 * not "false". Set DEMO_MODE=false at launch to switch them off.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE !== "false";
}
