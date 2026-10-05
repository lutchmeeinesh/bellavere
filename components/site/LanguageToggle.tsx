"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useState,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { writeLocaleCookie } from "@/lib/i18n/localeCookie";
import { cn } from "@/lib/utils";

/**
 * Links to the page being viewed in another language, and what a click on
 * one does. Shared by the EN | FR switch and the French-suggestion banner.
 *
 * - The path comes from the locale-aware usePathname ("/services" on both
 *   /services and /fr/services; "/index" read as "/", vercel/next.js#95648).
 * - The query string and hash are kept ("/services?ref=x#syndic" ->
 *   "/fr/services?ref=x#syndic"). Pages are static, so those are only known
 *   in the browser: they join the href after hydration (the server HTML has
 *   the bare path) and are read again from the address bar when clicked.
 * - A click remembers the choice (NEXT_LOCALE, lib/i18n/localeCookie.ts)
 *   before navigating, so the middleware already sees the new choice. Plain
 *   clicks navigate client-side; modified clicks (new tab or window) are
 *   left to the browser. Nothing is prefetched: a prefetch made under the
 *   old cookie could be a redirect back to the old language.
 * - The hrefs are complete, localized URLs, hence next/navigation's router
 *   and a plain <a> rather than the locale-aware helpers (which would add
 *   the current locale).
 */
export function useLocaleSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const path = pathname === "/index" ? "/" : pathname;
  const [suffix, setSuffix] = useState("");

  const refresh = useCallback(() => {
    setSuffix(window.location.search + window.location.hash);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("hashchange", refresh);
    window.addEventListener("popstate", refresh);
    return () => {
      window.removeEventListener("hashchange", refresh);
      window.removeEventListener("popstate", refresh);
    };
  }, [path, refresh]);

  const hrefFor = (code: AppLocale) =>
    getPathname({ href: path, locale: code }) + suffix;

  /**
   * Click handler for a link to `code` (call from the link's onClick).
   * Returns true when this page navigates (a plain click), false when the
   * browser opens the link elsewhere (new tab or window).
   */
  const choose = (
    code: AppLocale,
    event: MouseEvent<HTMLAnchorElement>,
  ): boolean => {
    writeLocaleCookie(code);
    const modified =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;
    if (modified) return false;
    event.preventDefault();
    router.push(
      getPathname({ href: path, locale: code }) +
        window.location.search +
        window.location.hash,
    );
    return true;
  };

  return { hrefFor, choose, refresh };
}

/**
 * EN | FR switch: the language codes as text, the current one underlined
 * in gold like the active header link. Each is a link to the page being
 * viewed in that language (useLocaleSwitch), with lang and hreflang; the
 * current one is marked with aria-current. Choosing a language moves the
 * underline at once and remembers the choice in the NEXT_LOCALE cookie, so
 * unprefixed URLs open in French from then on (middleware.ts); choosing the
 * language already shown only records the choice.
 *
 * - `tone="light"`: for dark backgrounds (the header over the home hero).
 * - `compact`: tighter spacing, for the phone header bar.
 * - `names`: the languages' own names ("English | Français") instead of the
 *   codes, for the mobile menu.
 * - `labelledBy`: the id of a visible label for the group (otherwise it is
 *   labelled "Language" for assistive technologies).
 */
export function LanguageToggle({
  tone = "default",
  compact = false,
  names = false,
  labelledBy,
  className,
}: {
  tone?: "default" | "light";
  compact?: boolean;
  names?: boolean;
  labelledBy?: string;
  className?: string;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("locale.toggle");
  const { hrefFor, choose, refresh } = useLocaleSwitch();
  // The language just clicked, underlined while its page loads.
  const [chosen, setChosen] = useState<AppLocale | null>(null);
  // One underline per rendered switch (the header renders several), so they
  // never animate into each other.
  const underlineId = `language-underline-${useId()}`;
  const light = tone === "light";
  const underlined = chosen ?? locale;

  return (
    <div
      role="group"
      aria-label={labelledBy ? undefined : t("label")}
      aria-labelledby={labelledBy}
      className={cn(
        "inline-flex shrink-0 items-center font-semibold",
        names ? "text-sm" : "text-xs tracking-wide",
        className,
      )}
    >
      {routing.locales.map((code: AppLocale, index) => {
        const name = t(`names.${code}`);
        const current = code === locale;
        return (
          <Fragment key={code}>
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "h-3.5 w-px",
                  compact ? "mx-0.5" : "mx-1",
                  light ? "bg-white/35" : "bg-sand-300",
                )}
              />
            ) : null}
            <a
              href={hrefFor(code)}
              hrefLang={code}
              lang={code}
              aria-current={current ? "true" : undefined}
              // The code is shown; the language's own name is what is read
              // out (and shown on hover).
              aria-label={names ? undefined : name}
              title={names ? undefined : name}
              onPointerEnter={refresh}
              onFocus={refresh}
              onClick={(event) => {
                if (current) {
                  event.preventDefault();
                  writeLocaleCookie(code);
                  return;
                }
                if (choose(code, event)) setChosen(code);
              }}
              className={cn(
                "relative rounded-sm transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
                compact ? "px-1 py-2.5" : names ? "px-2 py-2" : "px-1.5 py-2.5",
                code === underlined
                  ? light
                    ? "text-white"
                    : "text-navy-900"
                  : light
                    ? "text-white/80 hover:text-white"
                    : "text-ink-500 hover:text-navy-900",
              )}
            >
              {/* The code itself ("EN", "FR") in every language. */}
              {names ? name : code.toUpperCase()}
              {code === underlined ? (
                <motion.span
                  layoutId={underlineId}
                  aria-hidden
                  className={cn(
                    "absolute -bottom-0.5 h-0.5 rounded-full bg-gold-500",
                    compact ? "inset-x-1" : names ? "inset-x-2" : "inset-x-1.5",
                  )}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              ) : null}
            </a>
          </Fragment>
        );
      })}
    </div>
  );
}
