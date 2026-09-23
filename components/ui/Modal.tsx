"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const TABBABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Elements inside `root` that Tab can reach, in DOM order. */
function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => el.tabIndex >= 0 && el.getClientRects().length > 0
  );
}

/**
 * Focus handling for anything modal. While `active`: focus moves to
 * `panelRef` (give it tabIndex={-1}), Tab and Shift+Tab cycle inside it, and
 * Escape calls `onEscape`. When `active` turns off (or the component
 * unmounts) focus goes back to whatever had it before, usually the trigger.
 */
export function useFocusTrap(
  active: boolean,
  panelRef: React.RefObject<HTMLElement | null>,
  onEscape: () => void
) {
  // Callers often pass an inline arrow; reading it through a ref keeps the
  // effect below from re-running (and re-grabbing focus) on every render.
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    // Without preventScroll, a panel taller than the screen is scrolled to
    // its middle and the title starts out of view.
    panelRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeRef.current();
        return;
      }
      const panel = panelRef.current;
      // A panel hidden by CSS (e.g. past a breakpoint) must not swallow Tab.
      if (e.key !== "Tab" || !panel || panel.getClientRects().length === 0) {
        return;
      }
      const items = tabbables(panel);
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const inside = current instanceof Node && panel.contains(current);
      if (e.shiftKey) {
        if (!inside || current === first || current === panel) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus();
    };
  }, [active, panelRef]);
}

/**
 * Centred modal with fade/scale transition. The overlay itself scrolls, so a
 * dialog taller than the screen (a long form on a phone) can be read from
 * its title down to the submit button. Focus is trapped inside while open
 * and returned to the trigger on close; Escape, the close button and a
 * click outside the panel all close it.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Only a click that starts and ends outside the panel closes it, so
  // selecting text in a field and releasing over the overlay keeps the form.
  const pressedOutside = useRef(false);

  useFocusTrap(open, panelRef, onClose);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isOutsidePanel = (target: EventTarget) =>
    !panelRef.current?.contains(target as Node);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <div
            className="absolute inset-0 overflow-y-auto overscroll-contain"
            onPointerDown={(e) => {
              pressedOutside.current = isOutsidePanel(e.target);
            }}
            onClick={(e) => {
              if (pressedOutside.current && isOutsidePanel(e.target)) onClose();
            }}
          >
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative w-full max-w-lg rounded-2xl border border-sand-300 bg-white p-6 shadow-(--shadow-lift) focus:outline-none"
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <h3 id={titleId} className="text-xl">
                    {title}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-full p-1.5 text-ink-500 transition-colors hover:bg-sand-100 hover:text-navy-900"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
