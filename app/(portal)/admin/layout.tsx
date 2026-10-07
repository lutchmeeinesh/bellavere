import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { getCurrency } from "@/lib/currency";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Bellavere" },
  robots: { index: false, follow: false },
};

/** Admin shell. Middleware already restricts /admin; this is defence in depth. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const currency = await getCurrency();
  return (
    <CurrencyProvider initialCurrency={currency}>
      <div className="min-h-svh bg-sand-50">
        <AdminHeader admin={admin} />
        <main className="mx-auto w-full max-w-[1400px] p-5 sm:p-8">{children}</main>
      </div>
    </CurrencyProvider>
  );
}
