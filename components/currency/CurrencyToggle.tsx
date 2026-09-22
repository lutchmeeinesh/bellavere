"use client";

import { motion } from "framer-motion";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { CURRENCIES, type Currency } from "@/lib/format";
import { cn } from "@/lib/utils";

const LABELS: Record<Currency, { short: string; long: string }> = {
  EUR: { short: "EUR", long: "Euro (€)" },
  MUR: { short: "MUR", long: "Mauritian rupee (Rs)" },
};

/**
 * EUR / MUR segmented switch. `tone="light"` is for dark backgrounds (the
 * transparent header over the home hero).
 */
export function CurrencyToggle({
  tone = "default",
  layoutId = "currency-pill",
  className,
}: {
  tone?: "default" | "light";
  /** Unique per rendered instance so the sliding pills don't cross-animate. */
  layoutId?: string;
  className?: string;
}) {
  const { currency, setCurrency } = useMoney();
  const light = tone === "light";

  return (
    <div
      role="radiogroup"
      aria-label="Display currency"
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border p-0.5 text-xs font-semibold tracking-wide",
        light ? "border-white/30" : "border-sand-300 bg-white",
        className
      )}
    >
      {CURRENCIES.map((code) => {
        const active = code === currency;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={LABELS[code].long}
            title={LABELS[code].long}
            onClick={() => {
              if (!active) setCurrency(code);
            }}
            className={cn(
              "relative rounded-full px-2.5 py-1 transition-colors duration-200",
              active
                ? light
                  ? "text-navy-900"
                  : "text-white"
                : light
                  ? "text-white/80 hover:text-white"
                  : "text-ink-500 hover:text-navy-900"
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className={cn(
                  "absolute inset-0 rounded-full",
                  light ? "bg-white" : "bg-navy-900"
                )}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            ) : null}
            <span className="relative">{LABELS[code].short}</span>
          </button>
        );
      })}
    </div>
  );
}
