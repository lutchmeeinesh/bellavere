"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { CurrencyToggle } from "@/components/currency/CurrencyToggle";
import { NotificationBell } from "@/components/dashboard/shell/NotificationBell";
import { titleForPath } from "@/components/dashboard/shell/nav";
import type { ActivityItem } from "@/lib/types";

/**
 * Sticky dashboard topbar. Desktop shows the current section title; mobile
 * swaps it for the wordmark. The EUR/MUR switch re-renders every figure in
 * the dashboard, and the bell lists the latest activity from the server.
 */
export function Topbar({ recentActivity }: { recentActivity: ActivityItem[] }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-sand-300 bg-sand-50/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
        <div className="lg:hidden">
          <Logo href="/dashboard" />
        </div>
        <p className="hidden font-serif text-xl font-semibold text-navy-900 lg:block">
          {titleForPath(pathname)}
        </p>

        <div className="flex items-center gap-2">
          <CurrencyToggle layoutId="currency-pill-dashboard" />
          <NotificationBell items={recentActivity} />
        </div>
      </div>
    </header>
  );
}
