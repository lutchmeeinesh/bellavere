"use client";

import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

/**
 * The locale-aware Link (i18n/navigation.ts) as a client component. Shared
 * building blocks that the English-only portal renders too (Button, Logo)
 * use this: it reads the locale from the NextIntlClientProvider that both
 * root documents provide, so it never needs next-intl's request config.
 * Public components import `Link` from "@/i18n/navigation" directly.
 */
export function LocaleLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} />;
}
