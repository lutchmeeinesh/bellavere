"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
}

/**
 * Horizontal tab strip with a gold underline that slides between items
 * (shared `layoutId`). Controlled component.
 */
export function Tabs({
  items,
  activeId,
  onChange,
  layoutId = "tabs-underline",
  className,
}: {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
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
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors duration-150",
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
