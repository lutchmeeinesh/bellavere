"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, UserRound, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
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
 * Where each part of the bar appears, per language (measured with the
 * longest labels; the bar is at most 1200px wide):
 *
 * - English: the full bar from 1024px (lg), with the owner login as an icon
 *   button, and with its label from 1280px (xl). Between 1024 and 1119px
 *   the bar is tighter so the icon fits with at least 16px between the
 *   logo, the links and the buttons: nav links with 8px side padding
 *   instead of 12px, 8px between the buttons instead of 12px, and the icon
 *   button round (38px) instead of a 54px pill.
 * - French: the labels are longer ("Estimer mes revenus", "Espace
 *   propriétaire", "Confier votre bien"), so the full bar starts at 1152px,
 *   with the owner login as an icon button (its label does not fit next to
 *   everything else even at 1200px). Below 1152px the French header keeps
 *   the menu.
 * - With the menu: currency and EN | FR switches stay in the bar (the
 *   language switch tighter on phones, and only in the menu below 360px);
 *   the menu itself always has a language row with the full names.
 *
 * Literal class names, so Tailwind generates them.
 */
/**
 * Phone menu: grows open; closes the same way, or at once (custom = true)
 * when focus has already moved on to the page behind it.
 */
const MENU_VARIANTS = {
  open: { height: "auto", opacity: 1 },
  closed: (instant: boolean) =>
    instant
      ? { height: 0, opacity: 0, transition: { duration: 0 } }
      : { height: 0, opacity: 0 },
};

const BAR_CLASSES: Record<
  AppLocale,
  {
    nav: string;
    actions: string;
    compact: string;
    ownerIcon: string;
    ownerLabel: string | null;
  }
> = {
  en: {
    nav: "hidden lg:block",
    actions: "hidden lg:flex",
    compact: "lg:hidden",
    ownerIcon: "hidden lg:flex xl:hidden",
    ownerLabel: "hidden xl:flex",
  },
  fr: {
    nav: "hidden min-[1152px]:block",
    actions: "hidden min-[1152px]:flex",
    compact: "min-[1152px]:hidden",
    ownerIcon: "hidden min-[1152px]:flex",
    ownerLabel: null,
  },
};

/**
 * Fixed site header. Transparent over the home hero; frosted sand with a
 * bottom border after 40px of scroll (and always on inner pages). The active
 * link underline slides between items via a shared layoutId. The mobile menu
 * closes on navigation, on any link click, on Escape (focus then goes back
 * to the menu button) and when focus moves on to the page behind it (Tab
 * past its last item), so the focused element is never hidden under it.
 */
export function Header() {
  const t = useTranslations("common");
  const tLocale = useTranslations("locale.toggle");
  const locale = useLocale() as AppLocale;
  const bar = BAR_CLASSES[locale];
  const pathname = useSitePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Set when the menu closes because focus moved on to the page: it then
  // closes without its exit animation (which could pull the page back up and
  // leave the newly focused element off-screen).
  const [closeInstantly, setCloseInstantly] = useState(false);
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
  const tone = overHero ? "light" : "default";

  return (
    <header
      // Over the hero, focus rings are drawn on the dark photo (globals.css).
      data-surface={overHero ? "dark" : undefined}
      onBlur={(event) => {
        // Only a move to another element on the page closes the menu;
        // focus leaving the window (relatedTarget null) keeps it open.
        const next = event.relatedTarget;
        if (menuOpen && next && !event.currentTarget.contains(next)) {
          setCloseInstantly(true);
          setMenuOpen(false);
          requestAnimationFrame(() => {
            if (next instanceof HTMLElement) next.scrollIntoView({ block: "nearest" });
          });
        }
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-sand-300 bg-sand-50/80 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <Logo dark={overHero} />

        <nav aria-label={t("nav.label")} className={bar.nav}>
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
                      "relative block px-2 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 min-[1120px]:px-3 xl:px-3.5",
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
                        className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gold-500 min-[1120px]:inset-x-3 xl:inset-x-3.5"
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn("items-center gap-2 min-[1120px]:gap-3", bar.actions)}
        >
          <CurrencyToggle tone={tone} layoutId="currency-pill-header" />
          <LanguageToggle tone={tone} />
          {/* Compact owner login where its label does not fit (see BAR_CLASSES). */}
          <span className={bar.ownerIcon} title={t("actions.ownerLogin")}>
            <Button
              href="/login"
              variant={overHero ? "light" : "outline"}
              size="sm"
              // Round below 1120px, where the English bar is tightest.
              className="max-[1120px]:px-2"
            >
              <UserRound className="size-5" aria-hidden />
              <span className="sr-only">{t("actions.ownerLogin")}</span>
            </Button>
          </span>
          {bar.ownerLabel ? (
            <span className={bar.ownerLabel}>
              <Button
                href="/login"
                variant={overHero ? "light" : "outline"}
                size="sm"
                className="whitespace-nowrap"
              >
                {t("actions.ownerLogin")}
              </Button>
            </span>
          ) : null}
          <Button
            href="/contact"
            variant="primary"
            size="sm"
            className="whitespace-nowrap"
          >
            {t("actions.listProperty")}
          </Button>
        </div>

        <div className={cn("flex items-center gap-1 sm:gap-2", bar.compact)}>
          <CurrencyToggle tone={tone} layoutId="currency-pill-header-mobile" />
          {/* Below 360px it is only in the menu (see the end of the menu). */}
          <LanguageToggle
            tone={tone}
            compact
            className="max-[359px]:hidden sm:hidden"
          />
          <LanguageToggle tone={tone} className="max-sm:hidden" />
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
            onClick={() => {
              setCloseInstantly(false);
              setMenuOpen((v) => !v);
            }}
          >
            {menuOpen ? (
              <X className="size-6" aria-hidden />
            ) : (
              <Menu className="size-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence custom={closeInstantly}>
        {menuOpen ? (
          <motion.nav
            id="mobile-menu"
            aria-label={t("nav.mobileLabel")}
            // A link to the page already open leaves the pathname unchanged,
            // so close on the click itself as well.
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
            }}
            className={cn(
              "border-t border-sand-300 bg-sand-50/95 backdrop-blur-md",
              bar.compact,
            )}
            custom={closeInstantly}
            variants={MENU_VARIANTS}
            initial="closed"
            animate="open"
            exit="closed"
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
              <li className="mt-3 flex items-center justify-between gap-4 border-t border-sand-300 px-4 pt-3">
                <span id="mobile-menu-language" className="text-sm text-ink-500">
                  {tLocale("label")}
                </span>
                <LanguageToggle names labelledBy="mobile-menu-language" />
              </li>
              {/* Side by side when both labels fit on one line each,
                  otherwise stacked at full width. */}
              <li className="flex flex-wrap gap-3 px-4 pt-3 pb-1">
                <Button
                  href="/login"
                  variant="outline"
                  size="sm"
                  className="flex-1 whitespace-nowrap"
                >
                  {t("actions.ownerLogin")}
                </Button>
                <Button
                  href="/contact"
                  variant="primary"
                  size="sm"
                  className="flex-1 whitespace-nowrap"
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
