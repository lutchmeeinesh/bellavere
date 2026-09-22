import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing with scrypt. Stored format: "scrypt:<salt>:<hash>"
 * (both base64). Colons, not "$": Next.js's .env loader expands "$name"
 * sequences and would silently corrupt a "$"-separated hash.
 * Generate a hash with: node scripts/hash-password.mjs
 * Keep the parameters in sync with that script.
 */

const KEY_LENGTH = 64;
const PARAMS = { N: 16384, r: 8, p: 1 } as const;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH, PARAMS);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [algorithm, saltB64, hashB64] = stored.split(":");
  if (algorithm !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, PARAMS);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
