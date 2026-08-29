"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { Select } from "@/components/ui/Input";
import { NotificationBell } from "@/components/dashboard/shell/NotificationBell";
import { titleForPath } from "@/components/dashboard/shell/nav";
import type { ActivityItem } from "@/lib/types";

/**
 * Sticky dashboard topbar. Desktop shows the current section title and a
 * date-range selector; mobile swaps the title for the wordmark. The bell
 * lists the latest activity passed down from the server layout.
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
          {/*
            Decorative for the demo: the range selector looks real but is not
            wired to the data — every view reports its own fixed period.
          */}
          <Select
            aria-label="Date range"
            defaultValue="12m"
            className="hidden w-auto py-2 pl-3.5 pr-8 text-xs lg:block"
          >
            <option value="12m">Last 12 months</option>
            <option value="6m">Last 6 months</option>
            <option value="30d">Last 30 days</option>
          </Select>
          <NotificationBell items={recentActivity} />
        </div>
      </div>
    </header>
  );
}
