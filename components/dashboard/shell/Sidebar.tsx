"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import {
  DASHBOARD_NAV,
  isNavActive,
  type DashboardClient,
} from "@/components/dashboard/shell/nav";
import { cn } from "@/lib/utils";

/**
 * Fixed desktop sidebar (lg+). The active item's soft white pill slides
 * between links via a shared layoutId; items fade in with a short stagger
 * on mount. The client block at the bottom carries the logout form.
 */

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Sidebar({ client }: { client: DashboardClient }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-svh w-64 flex-col bg-navy-900 text-white lg:flex">
      <div className="px-6 pb-6 pt-7">
        <Logo dark href="/dashboard" />
      </div>

      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto px-3">
        <motion.ul
          className="space-y-1"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {DASHBOARD_NAV.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <motion.li key={item.href} variants={itemVariants} className="relative">
                {active ? (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl bg-white/5"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                ) : null}
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150",
                    active
                      ? "text-gold-500"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="size-4.5 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-sm font-semibold text-navy-900"
          >
            {client.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {client.name}
            </p>
            <p className="text-xs text-white/60">Owner</p>
          </div>
          <form method="post" action="/api/auth/logout">
            <button
              type="submit"
              aria-label="Log out"
              className="rounded-full p-2 text-white/60 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4.5" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
