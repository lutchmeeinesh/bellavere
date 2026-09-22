import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Admin — Bellavere",
  robots: { index: false, follow: false },
};

/** Admin shell. Middleware already restricts /admin; this is defence in depth. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-svh bg-sand-50">
      <AdminHeader admin={admin} />
      <main className="mx-auto w-full max-w-[1400px] p-5 sm:p-8">{children}</main>
    </div>
  );
}
