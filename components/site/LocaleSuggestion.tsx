"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Languages, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useLocaleSwitch } from "@/components/site/LanguageToggle";
import {
  LOCALE_CHOICE_EVENT,
  LOCALE_SUGGESTION_DISMISSED_KEY,
  hasLocaleCookie,
} from "@/lib/i18n/localeCookie";

/** Let the page's own entrance animations finish first. */
const SHOW_AFTER_MS = 1200;
const EASE = [0.22, 1, 0.36, 1] as const;

function rememberDismissal() {
  try {
    window.localStorage.setItem(LOCALE_SUGGESTION_DISMISSED_KEY, "dismissed");
  } catch {
    // Storage blocked: the suggestion stays closed until the next page load.
  }
}

/**
 * The French-suggestion card itself, loaded only for the visitors who may
 * see it (components/site/LocaleBanner.tsx decides, and explains the rules).
 *
 * Written in the language it suggests: messages `locale.suggestion` hold,
 * in each language's file, the suggestion its pages show, so the English
 * file has the French wording (and the French file the English wording,
 * unused while only English pages suggest a language).
 *
 * A floating card (no layout shift): under the header on phones, bottom
 * left from 640px, clear of the WhatsApp button (bottom right) and of the
 * page's calls to action. It appears after a short pause, rising and fading
 * in (at once, without either, with reduced motion: MotionConfig's "user"
 * setting only removes the movement). Closing it (button, or Escape from
 * anywhere on the page) is remembered in localStorage; picking a language
 * here or in the header switch writes the cookie, which hides it for good
 * as well. While it is open, focused elements keep clear of it
 * (data-locale-suggestion, app/globals.css), so it never hides the focus.
 */
export function LocaleSuggestion({ target }: { target: AppLocale }) {
  const t = useTranslations("locale.suggestion");
  const { hrefFor, linkEvents, choose } = useLocaleSwitch();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // A language picked while this card was loading counts too.
    const timer = window.setTimeout(
      () => setOpen(!hasLocaleCookie()),
      SHOW_AFTER_MS,
    );
    const onChoice = () => {
      window.clearTimeout(timer);
      setOpen(false);
    };
    window.addEventListener(LOCALE_CHOICE_EVENT, onChoice);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(LOCALE_CHOICE_EVENT, onChoice);
    };
  }, []);

  const dismiss = () => {
    rememberDismissal();
    setOpen(false);
  };

  // Escape closes the card wherever focus is, not only inside it. Another
  // layer that handles Escape first (e.g. the phone menu) prevents default.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      rememberDismissal();
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          key="locale-suggestion"
          aria-label={t("label")}
          lang={target}
          data-locale-suggestion
          className="fixed inset-x-4 top-21 z-30 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:left-5 sm:w-[26rem]"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }}
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
                {...linkEvents(target)}
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
