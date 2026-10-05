"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Languages, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useLocaleSwitch } from "@/components/site/LanguageToggle";
import {
  LOCALE_CHOICE_EVENT,
  hasLocaleCookie,
  LOCALE_SUGGESTION_DISMISSED_KEY,
} from "@/lib/i18n/localeCookie";

/**
 * The language each site's pages suggest to visitors whose browser prefers
 * it. Only the English pages suggest anything (French).
 */
const SUGGESTION: Partial<Record<AppLocale, AppLocale>> = { en: "fr" };

/** localStorage key: set once the visitor closes the suggestion. */
const DISMISSED_KEY = LOCALE_SUGGESTION_DISMISSED_KEY;
/** Let the page's own entrance animations finish first. */
const SHOW_AFTER_MS = 1200;
const EASE = [0.22, 1, 0.36, 1] as const;

/** First language of the browser (the client-side Accept-Language). */
function browserPrefers(locale: AppLocale): boolean {
  const first = navigator.languages?.[0] ?? navigator.language ?? "";
  return first.toLowerCase().startsWith(locale);
}

function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "dismissed";
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, "dismissed");
  } catch {
    // Storage blocked: the suggestion stays closed until the next page load.
  }
}

/**
 * Suggestion of the French version, on the English site, for visitors whose
 * browser's first language is French, who have not picked a language (no
 * NEXT_LOCALE cookie) and have not closed it before; once closed or once a
 * language is picked, it never comes back. Never redirects: the site does no
 * automatic language detection.
 *
 * Written in the language it suggests: messages `locale.suggestion` hold,
 * in each language's file, the suggestion its pages show, so the English
 * file has the French wording (and the French file the English wording,
 * unused while only English pages suggest a language).
 *
 * Decided in the browser after hydration, so the server HTML (static) has
 * nothing of it. A floating card (no layout shift): under the header on
 * phones, bottom left from 640px, clear of the WhatsApp button
 * (bottom right) and of the page's calls to action. Closing it (button or
 * Escape) is remembered in localStorage; picking a language here or in the
 * header switch writes the cookie, which hides it for good as well.
 */
export function LocaleBanner() {
  const locale = useLocale() as AppLocale;
  const target = SUGGESTION[locale];
  const t = useTranslations("locale.suggestion");
  const { hrefFor, choose, refresh } = useLocaleSwitch();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!target) return;
    if (!browserPrefers(target) || hasLocaleCookie() || wasDismissed()) return;
    const timer = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    const onChoice = () => {
      window.clearTimeout(timer);
      setOpen(false);
    };
    window.addEventListener(LOCALE_CHOICE_EVENT, onChoice);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LOCALE_CHOICE_EVENT, onChoice);
    };
  }, [target]);

  const dismiss = () => {
    rememberDismissal();
    setOpen(false);
  };

  if (!target) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          key="locale-suggestion"
          aria-label={t("label")}
          lang={target}
          onKeyDown={(event) => {
            if (event.key === "Escape") dismiss();
          }}
          className="fixed inset-x-4 top-21 z-30 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:left-5 sm:w-[26rem]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="flex items-start gap-3.5 rounded-2xl border border-sand-300 bg-white py-4 pr-2 pl-4 shadow-(--shadow-lift)">
            <span
              className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-700 sm:flex"
              aria-hidden
            >
              <Languages className="size-5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm leading-snug text-pretty text-ink-900">
                {t("message")}
              </p>
              <a
                href={hrefFor(target)}
                hrefLang={target}
                onPointerEnter={refresh}
                onFocus={refresh}
                onClick={(event) => {
                  choose(target, event);
                }}
                className="group mt-1.5 inline-flex items-center gap-1.5 rounded-sm py-0.5 text-sm font-medium text-navy-900 transition-colors duration-200 hover:text-gold-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
              >
                {t("action")}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t("dismiss")}
              title={t("dismiss")}
              className="shrink-0 rounded-full p-2 text-ink-500 transition-colors duration-200 hover:bg-sand-100 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
