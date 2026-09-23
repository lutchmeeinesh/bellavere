"use client";

import { useId, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
}

/** id of the tab button for `value` in the tab set `idBase`. */
export function tabId(idBase: string, value: string): string {
  return `${idBase}-tab-${value}`;
}

/** id of the panel that the tab for `value` controls. */
export function tabPanelId(idBase: string, value: string): string {
  return `${idBase}-panel-${value}`;
}

/**
 * Props for the element showing the active tab's content:
 * `<div {...tabPanelProps("property", tab)}>`. Pass the same `idBase` to
 * <Tabs> so the tab and its panel reference each other.
 */
export function tabPanelProps(idBase: string, value: string) {
  return {
    role: "tabpanel" as const,
    id: tabPanelId(idBase, value),
    "aria-labelledby": tabId(idBase, value),
    tabIndex: 0,
  };
}

/**
 * Horizontal tab strip with a gold underline that slides between items
 * (shared `layoutId`). Controlled component following the WAI-ARIA tabs
 * pattern: only the active tab is in the Tab order, and Arrow Left / Right,
 * Home and End move between tabs and activate them.
 */
export function Tabs({
  items,
  activeId,
  onChange,
  layoutId = "tabs-underline",
  idBase,
  label,
  className,
}: {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId?: string;
  /** Shared with tabPanelProps() so each tab points at its panel. */
  idBase?: string;
  /** Accessible name for the tab list, e.g. "Property sections". */
  label?: string;
  className?: string;
}) {
  const fallbackId = useId();
  const base = idBase ?? fallbackId;
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  // If nothing matches activeId, the first tab keeps the strip reachable.
  const focusableId = items.some((item) => item.id === activeId)
    ? activeId
    : items[0]?.id;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const count = items.length;
    const current = items.findIndex(
      (item) => tabRefs.current.get(item.id) === e.target
    );
    if (count === 0 || current === -1) return;
    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = (current + 1) % count;
        break;
      case "ArrowLeft":
        next = (current - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const target = items[next];
    tabRefs.current.get(target.id)?.focus();
    if (target.id !== activeId) onChange(target.id);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-sand-300",
        className
      )}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(node) => {
              if (node) tabRefs.current.set(item.id, node);
              else tabRefs.current.delete(item.id);
            }}
            type="button"
            role="tab"
            id={tabId(base, item.id)}
            aria-selected={active}
            // Consumers mount only the active panel, so only the active tab
            // points at one (an id that is not in the page would be invalid).
            aria-controls={
              idBase && active ? tabPanelId(idBase, item.id) : undefined
            }
            tabIndex={item.id === focusableId ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150",
              // The strip scrolls sideways, which would clip an outer ring.
              "focus-visible:-outline-offset-2",
              active ? "text-navy-900" : "text-ink-500 hover:text-navy-900"
            )}
          >
            {item.label}
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold-500"
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
