import type { Metadata } from "next";
import { getAdmin, requireClient } from "@/lib/auth";
import { AdminViewBanner } from "@/components/admin/AdminViewBanner";
import { activityForClient } from "@/lib/metrics";
import { getCurrency } from "@/lib/currency";
import { formatMoney } from "@/lib/format";
import { Sidebar } from "@/components/dashboard/shell/Sidebar";
import { Topbar } from "@/components/dashboard/shell/Topbar";
import { MobileNav } from "@/components/dashboard/shell/MobileNav";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";

export const metadata: Metadata = {
  // The root template adds " · Bellavere" to the default; pages get
  // "Bookings · Owner dashboard · Bellavere".
  title: {
    default: "Owner dashboard",
    template: "%s · Owner dashboard · Bellavere",
  },
  description:
    "Your Bellavere owner portal: revenue, occupancy, bookings and property care in one place.",
  robots: { index: false, follow: false },
};

/**
 * Dashboard shell: fixed navy sidebar on desktop, sticky topbar, fixed
 * bottom nav on mobile. `requireClient()` also protects not-found renders,
 * since this layout wraps them too.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await requireClient();
  // Set when a Bellavere admin is viewing this owner's portal.
  const admin = await getAdmin();
  const currency = await getCurrency();
  const recentActivity = activityForClient(client.id, 3, (eur) =>
    formatMoney(eur, currency)
  );

  return (
    <CurrencyProvider initialCurrency={currency}>
    <div className="min-h-svh bg-sand-50">
      <Sidebar
        client={{
          id: client.id,
          name: client.name,
          shortName: client.shortName,
          initials: client.initials,
          email: client.email,
        }}
      />
      <div className="lg:pl-64">
        {admin ? (
          <AdminViewBanner adminName={admin.shortName} clientName={client.name} />
        ) : null}
        <Topbar recentActivity={recentActivity} />
        <main className="mx-auto w-full max-w-[1400px] p-5 pb-24 sm:p-8 sm:pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
    </CurrencyProvider>
  );
}
