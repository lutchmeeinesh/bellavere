"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { CURRENCIES } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("common.currency");
  const light = tone === "light";
  // On static pages the switch first renders the default currency and jumps
  // to the visitor's saved choice while hydrating. Enable the sliding pill
  // only after that, so it animates real clicks, not the page load.
  const [animatePill, setAnimatePill] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatePill(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
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
            aria-label={t(`names.${code}`)}
            title={t(`names.${code}`)}
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
                layoutId={animatePill ? layoutId : undefined}
                className={cn(
                  "absolute inset-0 rounded-full",
                  light ? "bg-white" : "bg-navy-900"
                )}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            ) : null}
            {/* The ISO code itself ("EUR", "MUR") in every language. */}
            <span className="relative">{code}</span>
          </button>
        );
      })}
    </div>
  );
}
