import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { CurrencyToggle } from "@/components/currency/CurrencyToggle";
import type { Admin } from "@/data/admins";

/** Navy top bar for the admin area: wordmark, currency switch, user, logout. */
export function AdminHeader({ admin }: { admin: Admin }) {
  return (
    <header className="sticky top-0 z-30 bg-navy-900 text-white">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Logo dark href="/admin" />
          <Link
            href="/admin"
            className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-xs font-semibold tracking-(--tracking-label) text-gold-500 uppercase"
          >
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <CurrencyToggle tone="light" layoutId="currency-pill-admin" />
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium leading-tight">{admin.name}</p>
            <p className="text-xs text-white/60">{admin.title}</p>
          </div>
          <span
            aria-hidden
            className="hidden size-9 items-center justify-center rounded-full bg-gold-500 text-sm font-semibold text-navy-900 sm:flex"
          >
            {admin.initials}
          </span>
          <form method="post" action="/api/auth/logout">
            <button
              type="submit"
              aria-label="Log out"
              className="rounded-full p-2 text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-5" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
