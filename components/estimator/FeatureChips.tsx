"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { FEATURES, type Feature } from "@/data/estimator-config";
import { FEATURE_ICONS } from "@/components/estimator/icons";
import { cn } from "@/lib/utils";

/**
 * Multi-select chips (toggle buttons with aria-pressed). Choosing none is
 * fine; the live line under the chips says how many are selected.
 */
export function FeatureChips({
  value,
  onChange,
  labelledBy,
  describedBy,
}: {
  value: readonly Feature[];
  onChange: (next: Feature[]) => void;
  labelledBy: string;
  describedBy?: string;
}) {
  const t = useTranslations("estimator.features");

  const toggle = (feature: Feature) => {
    const next = value.includes(feature)
      ? value.filter((item) => item !== feature)
      : [...value, feature];
    // Keep the configured order, whatever the click order.
    onChange(FEATURES.filter((item) => next.includes(item)));
  };

  return (
    <div>
      <div
        role="group"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className="flex flex-wrap gap-3"
      >
        {FEATURES.map((feature) => {
          const pressed = value.includes(feature);
          const Icon = FEATURE_ICONS[feature];
          return (
            <button
              key={feature}
              type="button"
              aria-pressed={pressed}
              onClick={() => toggle(feature)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2.5 rounded-full border py-2.5 pr-4 pl-3.5 text-left text-sm font-medium",
                "transition-all duration-200 ease-out",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
                pressed
                  ? "border-navy-900 bg-navy-900 text-white shadow-(--shadow-soft)"
                  : "border-sand-300 bg-white text-ink-900 hover:-translate-y-0.5 hover:border-gold-500/70 hover:shadow-(--shadow-soft)",
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-colors duration-200",
                  pressed ? "text-gold-500" : "text-gold-700",
                )}
                aria-hidden
              />
              {t(`items.${feature}.label`)}
              {pressed ? (
                <Check
                  className="-mr-1 size-4 text-gold-500"
                  strokeWidth={2.5}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-5 text-sm text-ink-500">
        {t("count", { count: value.length })}
      </p>
    </div>
  );
}
