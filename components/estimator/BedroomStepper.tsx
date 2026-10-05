"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ESTIMATOR_CONFIG } from "@/data/estimator-config";
import { cn } from "@/lib/utils";

const { min: MIN, max: MAX } = ESTIMATOR_CONFIG.bedrooms;

/**
 * Bedrooms stepper, 1–6+ (the highest step reads "6+"). The number is a
 * WAI-ARIA spin button: arrow keys change it, Home/End jump to 1 and 6+;
 * the − / + buttons do the same for pointer users. `size="sm"` is the
 * compact version of the home-page quick start, the height of a form field.
 */
export function BedroomStepper({
  value,
  onChange,
  labelledBy,
  size = "lg",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  labelledBy: string;
  size?: "lg" | "sm";
  className?: string;
}) {
  const t = useTranslations("estimator.bedrooms");
  const reduceMotion = useReducedMotion();
  // Direction of the last change, so the number slides the right way.
  const [direction, setDirection] = useState(1);
  const large = size === "lg";

  const set = (next: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    if (clamped === value) return;
    setDirection(clamped > value ? 1 : -1);
    onChange(clamped);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
      case "PageUp":
        event.preventDefault();
        set(value + 1);
        break;
      case "ArrowDown":
      case "ArrowLeft":
      case "PageDown":
        event.preventDefault();
        set(value - 1);
        break;
      case "Home":
        event.preventDefault();
        set(MIN);
        break;
      case "End":
        event.preventDefault();
        set(MAX);
        break;
    }
  };

  const valueText =
    value >= MAX ? t("countMax", { count: MAX }) : t("count", { count: value });
  const display = value >= MAX ? `${MAX}+` : String(value);

  const buttonClasses = cn(
    "flex shrink-0 items-center justify-center rounded-full border border-sand-300 bg-white text-navy-900",
    "transition-colors duration-200 hover:border-navy-900",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-sand-300",
    large ? "size-12" : "size-8",
  );

  return (
    <div
      className={cn(
        "flex items-center",
        large
          ? "gap-6 sm:gap-8"
          : "h-[46px] justify-between gap-2 rounded-xl border border-sand-300 bg-white px-1.5",
        className,
      )}
    >
      <button
        type="button"
        className={buttonClasses}
        aria-label={t("fewer")}
        aria-disabled={value <= MIN}
        onClick={() => set(value - 1)}
      >
        <Minus className={large ? "size-5" : "size-4"} aria-hidden />
      </button>

      <div
        role="spinbutton"
        tabIndex={0}
        aria-labelledby={labelledBy}
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={value}
        aria-valuetext={valueText}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-lg text-center font-serif leading-none font-semibold text-navy-900 tabular-nums lining-nums",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
          large ? "h-20 w-24 text-7xl" : "h-8 min-w-10 text-2xl",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.span
            key={display}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ y: reduceMotion ? 0 : dir * 24, opacity: 0 }),
              center: { y: 0, opacity: 1 },
              exit: (dir: number) => ({ y: reduceMotion ? 0 : dir * -24, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        type="button"
        className={buttonClasses}
        aria-label={t("more")}
        aria-disabled={value >= MAX}
        onClick={() => set(value + 1)}
      >
        <Plus className={large ? "size-5" : "size-4"} aria-hidden />
      </button>
    </div>
  );
}
