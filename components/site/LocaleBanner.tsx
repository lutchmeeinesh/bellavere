"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import {
  hasLocaleCookie,
  LOCALE_SUGGESTION_DISMISSED_KEY,
} from "@/lib/i18n/localeCookie";

/** The card, in its own chunk: most visitors never see it. */
const LocaleSuggestion = lazy(() =>
  import("@/components/site/LocaleSuggestion").then((module) => ({
    default: module.LocaleSuggestion,
  })),
);

/**
 * The language each site's pages suggest to visitors whose browser prefers
 * it. Only the English pages suggest anything (French).
 */
const SUGGESTION: Partial<Record<AppLocale, AppLocale>> = { en: "fr" };

/** First language of the browser (the client-side Accept-Language). */
function browserPrefers(locale: AppLocale): boolean {
  const first = navigator.languages?.[0] ?? navigator.language ?? "";
  return first.toLowerCase().startsWith(locale);
}

function wasDismissed(): boolean {
  try {
    return (
      window.localStorage.getItem(LOCALE_SUGGESTION_DISMISSED_KEY) === "dismissed"
    );
  } catch {
    return false;
  }
}

/**
 * Suggestion of the French version, on the English site, for visitors whose
 * browser's first language is French, who have not picked a language (no
 * NEXT_LOCALE cookie) and have not closed it before; once closed or once a
 * language is picked, it never comes back. Never redirects: the site does no
 * automatic language detection.
 *
 * Decided in the browser after hydration, so the server HTML (static) has
 * nothing of it; the card (components/site/LocaleSuggestion.tsx) is loaded
 * only when it may be shown.
 */
export function LocaleBanner() {
  const locale = useLocale() as AppLocale;
  const target = SUGGESTION[locale];
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    setEligible(
      target !== undefined &&
        browserPrefers(target) &&
        !hasLocaleCookie() &&
        !wasDismissed(),
    );
  }, [target]);

  if (!target || !eligible) return null;
  return (
    <Suspense fallback={null}>
      <LocaleSuggestion target={target} />
    </Suspense>
  );
}
