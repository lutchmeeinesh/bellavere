"use client";

import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { writeLocaleCookie } from "@/lib/i18n/localeCookie";
import { cn } from "@/lib/utils";

/**
 * EN | FR switch (minimal version; phase 1 stream C designs it fully). The
 * other language is a link to the same page in that language, and choosing
 * it is remembered in the NEXT_LOCALE cookie, so unprefixed URLs open in
 * French from then on (middleware.ts). The cookie is written on click,
 * before the navigation reaches the middleware; the links are not
 * prefetched, since a prefetch made under the old cookie could be a
 * redirect back to the old language.
 *
 * `compact` (the phone header, where space is short) shows only the other
 * language, as a single pill.
 */
export function LanguageToggle({
  tone = "default",
  compact = false,
  className,
}: {
  /** "light" for dark backgrounds (the transparent header over the hero). */
  tone?: "default" | "light";
  compact?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("locale.toggle");
  const pathname = usePathname();
  // Same "/index" guard as the header (vercel/next.js#95648).
  const path = pathname === "/index" ? "/" : pathname;
  const light = tone === "light";

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border p-0.5 text-xs font-semibold tracking-wide",
        light ? "border-white/30" : "border-sand-300 bg-white",
        className,
      )}
    >
      {routing.locales.map((code: AppLocale) => {
        if (compact && code === locale) return null;
        const name = t(`names.${code}`);
        const itemClasses = "rounded-full px-2.5 py-1 transition-colors duration-200";
        // The language code itself ("EN", "FR") in every language.
        const label = code.toUpperCase();
        if (code === locale) {
          return (
            <span
              key={code}
              lang={code}
              aria-current="true"
              aria-label={name}
              title={name}
              className={cn(
                itemClasses,
                light ? "bg-white text-navy-900" : "bg-navy-900 text-white",
              )}
            >
              {label}
            </span>
          );
        }
        return (
          <NextLink
            key={code}
            href={getPathname({ href: path, locale: code })}
            hrefLang={code}
            lang={code}
            aria-label={name}
            title={name}
            prefetch={false}
            onClick={() => writeLocaleCookie(code)}
            className={cn(
              itemClasses,
              light
                ? "text-white/80 hover:text-white"
                : "text-ink-500 hover:text-navy-900",
            )}
          >
            {label}
          </NextLink>
        );
      })}
    </div>
  );
}
