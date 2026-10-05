"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/site/Logo";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { Button } from "@/components/ui/Button";
import { CurrencyToggle } from "@/components/currency/CurrencyToggle";
import { cn } from "@/lib/utils";

/**
 * The current path without its locale ("/services" on both /services and
 * /fr/services; "/" on / and /fr), with "/index" read as "/". When Vercel
 * regenerated the home page (ISR) it rendered it as "/index"
 * (vercel/next.js#95648) while the browser saw "/", so the header differed
 * between server and browser and React threw the server HTML away. Since
 * Wave 1 the home page is /[locale] ("/en" internally), which the locale-
 * aware usePathname reads as "/"; the "/index" guard stays as a harmless
 * safety net.
 */
function useSitePathname(): string {
  const pathname = usePathname();
  return pathname === "/index" ? "/" : pathname;
}

// Labels: messages `common.nav.*`. The estimator page arrives in phase 1.
const NAV_LINKS = [
  { href: "/", label: "home" },
  { href: "/services", label: "services" },
  { href: "/estimate", label: "estimate" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
] as const;

/**
 * Fixed site header. Transparent over the home hero; frosted sand with a
 * bottom border after 40px of scroll (and always on inner pages). The active
 * link underline slides between items via a shared layoutId. The mobile menu
 * closes on navigation, on any link click and on Escape (focus then goes
 * back to the menu button).
 */
export function Header() {
  const t = useTranslations("common");
  const pathname = useSitePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Only the home page has a dark full-bleed hero behind the header.
  const overHero = pathname === "/" && !scrolled && !menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-sand-300 bg-sand-50/80 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Logo dark={overHero} />

        <nav aria-label={t("nav.label")} className="hidden lg:block">
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
                      "relative block px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 xl:px-4",
                      overHero
                        ? "text-white/85 hover:text-white"
                        : "text-ink-900 hover:text-navy-900",
                      active && (overHero ? "text-white" : "text-navy-900"),
                    )}
                  >
                    {t(`nav.${link.label}`)}
                    {active ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-500 xl:inset-x-4"
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* From lg to xl the bar is too narrow for everything: the owner
            login stays in the footer (and the home hero) until xl. */}
        <div className="hidden items-center gap-3 lg:flex">
          <CurrencyToggle
            tone={overHero ? "light" : "default"}
            layoutId="currency-pill-header"
          />
          <LanguageToggle tone={overHero ? "light" : "default"} />
          <Button
            href="/login"
            variant={overHero ? "light" : "outline"}
            size="sm"
            className="max-xl:hidden"
          >
            {t("actions.ownerLogin")}
          </Button>
          <Button href="/contact" variant="primary" size="sm">
            {t("actions.listProperty")}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CurrencyToggle
            tone={overHero ? "light" : "default"}
            layoutId="currency-pill-header-mobile"
          />
          {/* Below 360px it moves into the menu (see the end of the menu). */}
          <LanguageToggle
            tone={overHero ? "light" : "default"}
            compact
            className="max-[359px]:hidden"
          />
          <button
            ref={menuButtonRef}
            type="button"
            className={cn(
              "rounded-full p-2 transition-colors",
              overHero ? "text-white" : "text-navy-900",
            )}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "mobile-menu" : undefined}
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="size-6" aria-hidden />
            ) : (
              <Menu className="size-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            id="mobile-menu"
            aria-label={t("nav.mobileLabel")}
            // A link to the page already open leaves the pathname unchanged,
            // so close on the click itself as well.
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
            }}
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
                          : "text-ink-900 hover:bg-sand-100",
                      )}
                    >
                      {t(`nav.${link.label}`)}
                    </Link>
                  </li>
                );
              })}
              <li className="px-4 pt-2 min-[360px]:hidden">
                <LanguageToggle />
              </li>
              <li className="flex gap-3 px-4 pt-3 pb-1">
                <Button
                  href="/login"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {t("actions.ownerLogin")}
                </Button>
                <Button
                  href="/contact"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  {t("actions.listProperty")}
                </Button>
              </li>
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
