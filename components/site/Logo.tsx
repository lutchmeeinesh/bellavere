"use client";

import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { LOGO_LINK_CLASSES, LogoMark } from "@/components/site/LogoMark";
import { company } from "@/data/company";
import { cn } from "@/lib/utils";

/**
 * Bellavere wordmark: small gold lozenge + Cormorant wordmark. A client
 * component so the English-only portal can render it too: the link and its
 * label follow the language of the NextIntlClientProvider above it.
 */
export function Logo({
  dark = false,
  href = "/",
  className,
}: {
  /** dark = for use on dark backgrounds (white text). */
  dark?: boolean;
  href?: string;
  className?: string;
}) {
  const t = useTranslations("common.logo");
  return (
    <LocaleLink
      href={href}
      className={cn(LOGO_LINK_CLASSES, className)}
      aria-label={t("label", { company: company.name })}
    >
      <LogoMark dark={dark} />
    </LocaleLink>
  );
}
