/**
 * Generate a password hash for an admin account.
 *
 *   node scripts/hash-password.mjs "the new password"
 *
 * Paste the printed value into the matching environment variable
 * (e.g. ADMIN_KRIT_PASSWORD_HASH) in .env.local locally, or in the Vercel
 * project settings in production. Parameters must match lib/password.ts.
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: node scripts/hash-password.mjs "password of at least 12 characters"');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(`scrypt:${salt.toString("base64")}:${hash.toString("base64")}`);
