"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { ActivityIcon } from "@/components/dashboard/ActivityIcon";
import type { ActivityItem } from "@/lib/types";
import { formatDateShort } from "@/lib/format";

/**
 * Topbar bell with an unread dot. A disclosure: the button toggles a
 * labelled panel listing the most recent activity items. It closes on
 * outside click, on tabbing out, when a link inside is followed, or on
 * Escape (which also puts focus back on the bell).
 */
export function NotificationBell({ items }: { items: ActivityItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const headingId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        // Focus moving to something outside (Tab past the last link).
        const next = e.relatedTarget;
        if (open && next instanceof Node && !e.currentTarget.contains(next)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-navy-900 transition-colors duration-150 hover:bg-sand-100"
      >
        <Bell className="size-5" aria-hidden />
        {items.length > 0 ? (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold-500 ring-2 ring-sand-50"
          />
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headingId}
            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-sand-300 bg-white p-2 shadow-(--shadow-lift)"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <p
              id={headingId}
              className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-(--tracking-label) text-ink-500"
            >
              Recent activity
            </p>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-sand-50">
                    <ActivityIcon type={item.type} className="size-8" />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm text-ink-900">
                        {item.message}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {formatDateShort(item.date)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {items.length === 0 ? (
                <li className="px-3 py-4 text-sm text-ink-500">
                  You&apos;re all caught up.
                </li>
              ) : null}
            </ul>
            <div className="border-t border-sand-300/60 px-3 py-2.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gold-700 transition-colors duration-150 hover:text-navy-900"
              >
                View all activity
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
