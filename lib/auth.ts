import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClientByEmail, getClientById } from "@/data/clients";
import { getAdminByEmail, getAdminById, type Admin } from "@/data/admins";
import { verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  VIEW_AS_COOKIE,
  isDemoMode,
  verifySession,
  type Role,
  type SessionPayload,
} from "@/lib/session";
import type { Client } from "@/lib/types";

/**
 * Server-side auth helpers. Sessions are HMAC-signed cookies (lib/session.ts);
 * passwords are scrypt hashes (lib/password.ts). Owners see only their own
 * data; admins see everything and can open any owner's portal ("view as").
 */

export { SESSION_COOKIE, VIEW_AS_COOKIE };

/**
 * The verified session. Memoised per request: the layout, the page and their
 * metadata all ask for it, and the HMAC check only needs to run once.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
});

/** The signed-in administrator, or null. */
export async function getAdmin(): Promise<Admin | null> {
  const session = await getSession();
  if (session?.role !== "admin") return null;
  return getAdminById(session.sub) ?? null;
}

/**
 * The owner whose data the current request may see: the signed-in owner, or
 * — for an admin — the owner they chose to view. Null otherwise.
 */
export async function getSessionClient(): Promise<Client | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "owner") {
    return isDemoMode() ? getClientById(session.sub) ?? null : null;
  }
  if (!getAdminById(session.sub)) return null;
  const viewAs = (await cookies()).get(VIEW_AS_COOKIE)?.value;
  return viewAs ? getClientById(viewAs) ?? null : null;
}

/**
 * For dashboard pages: returns the owner to show, or redirects. Middleware
 * already guards the route; this is defence in depth and gives pages a
 * typed, non-null client to filter data by.
 */
export async function requireClient(): Promise<Client> {
  const session = await getSession();
  if (!session) redirect("/login");
  const client = await getSessionClient();
  if (!client) redirect(session.role === "admin" ? "/admin" : "/login");
  return client;
}

/** For /admin pages: returns the admin, or redirects everyone else away. */
export async function requireAdmin(): Promise<Admin> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");
  const admin = getAdminById(session.sub);
  if (!admin) redirect("/login");
  return admin;
}

/** Checks a sign-in attempt against admins first, then demo owners. */
export function verifyCredentials(
  email: string,
  password: string
): { role: Role; id: string } | null {
  const admin = getAdminByEmail(email);
  if (admin) {
    const hash = process.env[admin.passwordHashEnv];
    return verifyPassword(password, hash) ? { role: "admin", id: admin.id } : null;
  }
  if (!isDemoMode()) return null;
  const client = getClientByEmail(email);
  if (client && verifyPassword(password, client.passwordHash)) {
    return { role: "owner", id: client.id };
  }
  return null;
}
