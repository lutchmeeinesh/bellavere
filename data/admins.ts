/**
 * Bellavere staff with administrator access: they can see every owner's
 * information and open any owner's portal.
 *
 * Password hashes are NOT stored in the code. Each admin's hash is read from
 * the environment variable named in `passwordHashEnv` (set in .env.local
 * locally and in the Vercel project settings in production). Generate one
 * with: node scripts/hash-password.mjs "new password"
 */

export interface Admin {
  id: string;
  name: string;
  shortName: string;
  /** Login email (case-insensitive). */
  email: string;
  title: string;
  initials: string;
  passwordHashEnv: string;
}

export const admins: Admin[] = [
  {
    id: "a-krit",
    name: "Krit Goburdhan",
    shortName: "Krit",
    email: "kritgoburdhan@gmail.com",
    title: "General Manager & Site Supervisor",
    initials: "KG",
    passwordHashEnv: "ADMIN_KRIT_PASSWORD_HASH",
  },
  {
    id: "a-ankit",
    name: "Ankit Dookhorun",
    shortName: "Ankit",
    email: "zoodookhorun@gmail.com",
    title: "Client Relations",
    initials: "AD",
    passwordHashEnv: "ADMIN_ANKIT_PASSWORD_HASH",
  },
  {
    id: "a-inesh",
    // Name and email as configured in this repository's git identity.
    name: "Lutchmee Inesh",
    shortName: "Inesh",
    email: "lutchmeeinesh@gmail.com",
    title: "Administrator",
    initials: "LI",
    passwordHashEnv: "ADMIN_INESH_PASSWORD_HASH",
  },
];

export function getAdminById(id: string): Admin | undefined {
  return admins.find((a) => a.id === id);
}

export function getAdminByEmail(email: string): Admin | undefined {
  const needle = email.trim().toLowerCase();
  return admins.find((a) => a.email.toLowerCase() === needle);
}
