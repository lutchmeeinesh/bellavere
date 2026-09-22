import type { Metadata } from "next";
import { requireClient } from "@/lib/auth";
import { activityForClient } from "@/lib/metrics";
import { getCurrency } from "@/lib/currency";
import { formatMoney } from "@/lib/format";
import { Sidebar } from "@/components/dashboard/shell/Sidebar";
import { Topbar } from "@/components/dashboard/shell/Topbar";
import { MobileNav } from "@/components/dashboard/shell/MobileNav";

export const metadata: Metadata = {
  title: "Owner dashboard — Bellavere",
  description:
    "Your Bellavere owner portal: revenue, occupancy, bookings and property care in one place.",
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
  const currency = await getCurrency();
  const recentActivity = activityForClient(client.id, 3, (eur) =>
    formatMoney(eur, currency)
  );

  return (
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
        <Topbar recentActivity={recentActivity} />
        <main className="mx-auto w-full max-w-[1400px] p-5 pb-24 sm:p-8 sm:pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
