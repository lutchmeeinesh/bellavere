"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, MoreHorizontal } from "lucide-react";
import {
  DASHBOARD_NAV,
  isNavActive,
  type DashboardNavItem,
} from "@/components/dashboard/shell/nav";
import { useFocusTrap } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

/**
 * Fixed bottom navigation for < lg screens: the four main sections plus a
 * "More" button that opens a bottom sheet with the remaining pages and the
 * logout form. The sheet is modal: focus moves into it and stays there, and
 * closing it (Escape, backdrop, navigating) hands focus back to "More".
 */

const PRIMARY = DASHBOARD_NAV.slice(0, 4); // Overview, Properties, Bookings, Maintenance
const SECONDARY = DASHBOARD_NAV.slice(4); // Statements, Documents, Settings

export function MobileNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close the sheet after navigating.
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  // The sheet only exists below lg: close it if the window grows past that,
  // so its focus trap can't hold on to a hidden panel.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setSheetOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  useFocusTrap(sheetOpen, sheetRef, () => setSheetOpen(false));

  const moreActive = SECONDARY.some((item) => isNavActive(pathname, item));

  return (
    <>
      <nav
        aria-label="Dashboard navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-900 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="flex">
          {PRIMARY.map((item) => (
            <li key={item.href} className="flex-1">
              <MobileNavLink item={item} active={isNavActive(pathname, item)} />
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              aria-expanded={sheetOpen}
              aria-haspopup="dialog"
              onClick={() => setSheetOpen(true)}
              className={cn(
                "flex w-full flex-col items-center gap-1 py-2.5 transition-colors duration-150",
                moreActive || sheetOpen
                  ? "text-gold-500"
                  : "text-white/65 hover:text-white"
              )}
            >
              <MoreHorizontal className="size-5" aria-hidden />
              <span className="text-[10px] font-medium tracking-wide">More</span>
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {sheetOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
              onClick={() => setSheetOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="More pages"
              tabIndex={-1}
              // A link to the page already open doesn't change the pathname,
              // so close on any link click (the logout button is not a link).
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) {
                  setSheetOpen(false);
                }
              }}
              className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-sand-300 bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] focus:outline-none"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                aria-hidden
                className="mx-auto mb-4 h-1 w-10 rounded-full bg-sand-300"
              />
              <ul className="space-y-1">
                {SECONDARY.map((item) => {
                  const active = isNavActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors duration-150",
                          active
                            ? "bg-sand-100 text-navy-900"
                            : "text-ink-900 hover:bg-sand-100"
                        )}
                      >
                        <item.icon className="size-5 text-ink-500" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="border-t border-sand-300/60 pt-1">
                  <form method="post" action="/api/auth/logout">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-danger-700 transition-colors duration-150 hover:bg-danger/5"
                    >
                      <LogOut className="size-5" aria-hidden />
                      Log out
                    </button>
                  </form>
                </li>
              </ul>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function MobileNavLink({
  item,
  active,
}: {
  item: DashboardNavItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-col items-center gap-1 py-2.5 transition-colors duration-150",
        active ? "text-gold-500" : "text-white/65 hover:text-white"
      )}
    >
      <item.icon className="size-5" aria-hidden />
      <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
    </Link>
  );
}
