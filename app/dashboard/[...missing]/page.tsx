import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DashboardNotFound from "@/app/dashboard/not-found";

/**
 * The portal's 404 page, inside the dashboard shell. middleware.ts rewrites
 * unknown dashboard paths and other owners' property ids here with a 404
 * status, set before rendering because the dashboard streams. With that
 * status Next.js takes the title from not-found.tsx and never calls
 * generateMetadata below; it only runs if a request reaches this page some
 * other way, and then asks Next.js for the not-found state as well.
 */
export async function generateMetadata(): Promise<Metadata> {
  notFound();
}

export default function DashboardMissingPage() {
  return <DashboardNotFound />;
}
