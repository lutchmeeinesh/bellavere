"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { ESTIMATOR_CONFIG } from "@/data/estimator-config";
import { cn } from "@/lib/utils";

const { min: MIN, max: MAX, step: STEP } = ESTIMATOR_CONFIG.weeks;

// Native range input (keyboard and screen readers for free), restyled: a
// sand track filled in gold up to a white thumb with a gold ring. Class
// names are spelled out in full so Tailwind finds them.
const RANGE_CLASSES = cn(
  "h-2 w-full cursor-pointer appearance-none rounded-full",
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500",
  "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full",
  "[&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-(--shadow-soft) [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150",
  "hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-110",
  "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent",
  "[&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold-500 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-(--shadow-soft)",
);

/** Weeks a year the property is available to guests (part-year owners). */
export function WeeksSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (weeks: number) => void;
}) {
  const t = useTranslations("estimator.availability");
  const id = useId();
  const fill = ((value - MIN) / (MAX - MIN)) * 100;
  const label = t("weeks", { weeks: value });

  return (
    <div className="rounded-2xl bg-sand-100 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <label htmlFor={id} className="text-sm font-medium text-navy-900">
          {t("weeksLabel")}
        </label>
        <output
          htmlFor={id}
          className="font-serif text-3xl leading-none font-semibold text-navy-900 tabular-nums lining-nums"
        >
          {label}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={value}
        aria-valuetext={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn("mt-5", RANGE_CLASSES)}
        style={{
          // The filled part of the track, in the brand colours.
          background: `linear-gradient(to right, var(--gold-500) ${fill}%, var(--sand-300) ${fill}%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-xs text-ink-500" aria-hidden>
        <span>{t("weeks", { weeks: MIN })}</span>
        <span>{t("weeks", { weeks: MAX })}</span>
      </div>
    </div>
  );
}
