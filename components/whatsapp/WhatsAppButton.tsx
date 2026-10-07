"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { WHATSAPP_COLOR_VARS, WhatsAppIcon } from "@/components/whatsapp/WhatsAppIcon";
import { useWhatsAppState } from "@/components/whatsapp/WhatsAppProvider";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_PRIMARY } from "@/data/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The round button's size in px (Tailwind `size-14`). */
const BUTTON_SIZE = 56;
/** Extra clearance around the button when checking what it would cover. */
const CLEARANCE = 12;

/**
 * What the button steps aside for: forms in the page content, and anything
 * a page marks with `data-whatsapp-avoid` (e.g. a sticky bar of its own).
 */
const AVOID_SELECTOR = "main form, [data-whatsapp-avoid]"; // i18n-ignore (CSS selector)
/** Fields that bring up an on-screen keyboard (or a picker) on phones. */
const TEXT_FIELD_SELECTOR =
  'input:not([type="checkbox"],[type="radio"],[type="button"],[type="submit"],[type="reset"],[type="range"],[type="color"],[type="file"],[type="image"],[type="hidden"]),textarea,select,[contenteditable=""],[contenteditable="true"]';
/** Screens with an on-screen keyboard: phones, tablets, touch laptops. */
const KEYBOARD_SCREENS = "(max-width: 1023px), (pointer: coarse)";
/** How long a tap keeps the label open (the chat opens in another tab or app). */
const TAP_LABEL_MS = 2500;

/** The pulse plays once per visit: the first time the button appears. */
let pulsePlayed = false;

/**
 * True while the button should step aside so it never covers what the
 * visitor is using: while a form (or a marked element) is behind it, and,
 * on touch and small screens, while a text field has focus (the on-screen
 * keyboard leaves little room, and the form's submit button must stay
 * visible). `anchor` is the button's fixed wrapper; its bottom-right corner
 * does not move while the label opens, so the measurement cannot flicker.
 */
function useStepAside(
  anchor: React.RefObject<HTMLElement | null>,
  active: boolean,
): boolean {
  const [overForm, setOverForm] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!active) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const wrapper = anchor.current;
      if (!wrapper) return;
      const box = wrapper.getBoundingClientRect();
      const right = box.right + CLEARANCE;
      const bottom = box.bottom + CLEARANCE;
      const left = box.right - BUTTON_SIZE - CLEARANCE;
      const top = box.bottom - BUTTON_SIZE - CLEARANCE;
      const covered = Array.from(document.querySelectorAll(AVOID_SELECTOR)).some(
        (element) => {
          const r = element.getBoundingClientRect();
          return (
            r.width > 0 &&
            r.height > 0 &&
            r.left < right &&
            r.right > left &&
            r.top < bottom &&
            r.bottom > top
          );
        },
      );
      setOverForm(covered);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const keyboardScreens = window.matchMedia(KEYBOARD_SCREENS);
    const checkFocus = () => {
      const focused = document.activeElement;
      setTyping(
        keyboardScreens.matches &&
          focused instanceof Element &&
          focused.matches(TEXT_FIELD_SELECTOR),
      );
    };
    // On focusout, activeElement is still the old field: check once the
    // focus has moved.
    const checkFocusLater = () => window.setTimeout(checkFocus, 0);

    schedule();
    checkFocus();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("focusin", checkFocus);
    document.addEventListener("focusout", checkFocusLater);
    keyboardScreens.addEventListener("change", checkFocus);
    // Content that changes without scrolling: a form replaced by its
    // success message, an accordion opening above a form, images loading.
    const resizes = new ResizeObserver(schedule);
    resizes.observe(document.body);
    const mutations = new MutationObserver(schedule);
    const main = document.querySelector("main");
    if (main) mutations.observe(main, { childList: true, subtree: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("focusin", checkFocus);
      document.removeEventListener("focusout", checkFocusLater);
      keyboardScreens.removeEventListener("change", checkFocus);
      resizes.disconnect();
      mutations.disconnect();
    };
  }, [anchor, active]);

  return active && (overForm || typing);
}

/**
 * Floating WhatsApp button on every public page (app/[locale]/(site)/
 * layout.tsx, after the footer, so it comes last in the reading and tab
 * order). A green WhatsApp circle in the bottom-right corner that opens a
 * pill with "Chat with us on WhatsApp" on hover, keyboard focus or tap, and
 * opens a chat with the primary number (Ankit), pre-filled with the current
 * page's message (useWhatsAppOverride) or the default one of the page's
 * language. Clicks are recorded as "WhatsApp Clicked" (placement
 * "floating").
 *
 * - Hidden entirely while a page asks for it (the estimator's questions).
 *   Pages that know this from the start also mark it in their server HTML
 *   (data-whatsapp-hidden, see app/globals.css), so it never flashes before
 *   hydration.
 * - Steps aside while a form is behind it, and on phones while a text field
 *   has focus, so it never covers a field or a submit button.
 * - Adds a navy strip below the footer (the footer's colour) so, scrolled
 *   to the very bottom, it never covers the footer's last lines. Only below
 *   1296px: from there the button sits right of the footer's 1200px column.
 * - Pulses softly the first time it appears in a visit; no pulse, and no
 *   movement, with reduced motion.
 * - Boundary: a 2px ring of WhatsApp's teal green (3:1 or more against the
 *   sand, white and navy surfaces); the label is navy on white (16:1). The
 *   white glyph on the brand green is 1.98:1, an accepted exception
 *   (ASSUMPTIONS.md): the brand mark is recognisable by its shape, the ring
 *   gives the button its boundary and the link's name carries the meaning.
 * - Keyboard focus: a two-tone ring, white then navy (app/globals.css), as
 *   the button floats over every surface, often two at once.
 * - In its own landmark (an aside named like the button), so screen-reader
 *   users find it among the page's regions.
 */
export function WhatsAppButton() {
  const { hidden, message } = useWhatsAppState();
  const locale = useLocale();
  const t = useTranslations("whatsapp.button");
  const tc = useTranslations("common.social");
  const reduceMotion = useReducedMotion();
  const anchor = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [pulse, setPulse] = useState(false);
  const tapTimer = useRef<number | undefined>(undefined);

  const steppingAside = useStepAside(anchor, !hidden) && !focused;

  useEffect(() => {
    if (hidden || reduceMotion || pulsePlayed) return;
    pulsePlayed = true;
    setPulse(true);
  }, [hidden, reduceMotion]);

  useEffect(() => () => window.clearTimeout(tapTimer.current), []);

  const label = t("label");
  const href = whatsappUrl(
    WHATSAPP_PRIMARY,
    message ?? WHATSAPP_DEFAULT_MESSAGE[locale],
  );

  return (
    <>
      {hidden ? null : (
        <div
          aria-hidden
          data-whatsapp-float
          className="h-[calc(2rem+env(safe-area-inset-bottom))] bg-navy-900 min-[1296px]:hidden"
        />
      )}
      <AnimatePresence initial={false}>
        {hidden ? null : (
          <motion.aside
            key="whatsapp-button"
            ref={anchor}
            aria-label={label}
            data-whatsapp-float
            style={WHATSAPP_COLOR_VARS}
            className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tc("newTab", { label })}
              data-expanded={tapped ? "" : undefined}
              onClick={() =>
                track("WhatsApp Clicked", { placement: "floating", locale })
              }
              onPointerDown={(event) => {
                if (event.pointerType === "mouse") return;
                setTapped(true);
                window.clearTimeout(tapTimer.current);
                tapTimer.current = window.setTimeout(
                  () => setTapped(false),
                  TAP_LABEL_MS,
                );
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={cn(
                "group flex items-center rounded-full shadow-(--shadow-lift) ring-2 ring-(--wa-deep)",
                "transition-[background-color,opacity,translate,visibility] duration-300 ease-out",
                "hover:bg-white focus-visible:bg-white data-expanded:bg-white",
                // Focus ring: two-tone, in app/globals.css ([data-whatsapp-float]).
                steppingAside &&
                  "pointer-events-none invisible translate-y-3 opacity-0",
              )}
            >
              {/* The label: a grid column animated from 0fr to 1fr, so the
                  pill opens to exactly the text's width. */}
              <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr] group-data-expanded:grid-cols-[1fr]">
                <span className="min-w-0 overflow-hidden">
                  <span className="block pr-3 pl-5 text-sm font-medium whitespace-nowrap text-navy-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-100 group-focus-visible:opacity-100 group-focus-visible:delay-100 group-data-expanded:opacity-100 group-data-expanded:delay-100">
                    {label}
                  </span>
                </span>
              </span>
              <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-(--wa-green) text-white">
                {/* Its own AnimatePresence: the outer one's initial={false}
                    would otherwise skip straight to the pulse's end state. */}
                <AnimatePresence>
                  {pulse ? (
                    <motion.span
                      key="pulse"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-(--wa-green)"
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.75 }}
                      transition={{
                        duration: 1.6,
                        ease: "easeOut",
                        delay: 1.2,
                        repeat: 1,
                        repeatDelay: 0.6,
                      }}
                      onAnimationComplete={() => setPulse(false)}
                    />
                  ) : null}
                </AnimatePresence>
                <WhatsAppIcon className="relative size-7" />
              </span>
            </a>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
