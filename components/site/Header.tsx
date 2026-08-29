"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Fixed site header. Transparent over the home hero; frosted sand with a
 * bottom border after 40px of scroll (and always on inner pages). The active
 * link underline slides between items via a shared layoutId.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Only the home page has a dark full-bleed hero behind the header.
  const overHero = pathname === "/" && !scrolled && !menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-sand-300 bg-sand-50/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Logo dark={overHero} />

        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block px-4 py-2 text-sm font-medium transition-colors duration-200",
                      overHero
                        ? "text-white/85 hover:text-white"
                        : "text-ink-900 hover:text-navy-900",
                      active && (overHero ? "text-white" : "text-navy-900")
                    )}
                  >
                    {link.label}
                    {active ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-500"
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/login" variant={overHero ? "light" : "outline"} size="sm">
            Owner login
          </Button>
          <Button href="/contact" variant="primary" size="sm">
            List your property
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "rounded-full p-2 transition-colors lg:hidden",
            overHero ? "text-white" : "text-navy-900"
          )}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="border-t border-sand-300 bg-sand-50/95 backdrop-blur-md lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ul className="space-y-1 px-5 py-4">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        active
                          ? "bg-sand-100 text-navy-900"
                          : "text-ink-900 hover:bg-sand-100"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="flex gap-3 px-4 pt-3 pb-1">
                <Button href="/login" variant="outline" size="sm" className="flex-1">
                  Owner login
                </Button>
                <Button href="/contact" variant="primary" size="sm" className="flex-1">
                  List your property
                </Button>
              </li>
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
