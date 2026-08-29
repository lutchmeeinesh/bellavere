import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClientByEmail, getClientById } from "@/data/clients";
import type { Client } from "@/lib/types";

/**
 * Mock cookie-based auth for the demo. The httpOnly `bv_session` cookie
 * stores the client id directly — swap this module (and the /api/auth
 * routes) for a real provider before production. See README.
 */

export const SESSION_COOKIE = "bv_session";

export async function getSessionClient(): Promise<Client | null> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return getClientById(id) ?? null;
}

/**
 * For dashboard server components: returns the logged-in client or redirects
 * to /login. Middleware already guards the route; this is defence in depth
 * and gives pages a typed, non-null client to filter data by.
 */
export async function requireClient(): Promise<Client> {
  const client = await getSessionClient();
  if (!client) redirect("/login");
  return client;
}

export function verifyCredentials(
  email: string,
  password: string
): Client | null {
  const client = getClientByEmail(email);
  if (!client || client.password !== password) return null;
  return client;
}
