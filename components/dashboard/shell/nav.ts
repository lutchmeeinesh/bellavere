import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
  Wrench,
} from "lucide-react";

/**
 * Shared definitions for the dashboard shell: the nav tree, active-state
 * matching and the pathname → topbar-title mapping. Kept in one module so
 * the sidebar, topbar and mobile nav can never drift apart.
 */

/** Serializable subset of Client that server layouts pass to shell components. */
export interface DashboardClient {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  email: string;
}

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Overview matches exactly; everything else matches by prefix. */
  exact?: boolean;
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/statements", label: "Statements", icon: Receipt },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function isNavActive(pathname: string, item: DashboardNavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/** Topbar title for the current route (detail pages inherit their section). */
export function titleForPath(pathname: string): string {
  const match = DASHBOARD_NAV.filter((item) =>
    isNavActive(pathname, item)
  ).sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Dashboard";
}
