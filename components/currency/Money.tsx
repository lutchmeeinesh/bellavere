"use client";

import { CountUp } from "@/components/ui/CountUp";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { conversionRateLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Renders an EUR amount in the visitor's chosen currency. Usable from
 * server components (it is a client leaf), so pages never hard-code a
 * currency.
 */
export function Money({
  eur,
  precise = false,
  className,
}: {
  eur: number;
  precise?: boolean;
  className?: string;
}) {
  const money = useMoney();
  return (
    <span className={className}>
      {precise ? money.formatPrecise(eur) : money.format(eur)}
    </span>
  );
}

/** Count-up figure for money KPIs ("€8,420" / "Rs 437,840"). */
export function MoneyCountUp({ eur }: { eur: number }) {
  const money = useMoney();
  // key: restart the count when the currency flips.
  return (
    <CountUp
      key={money.currency}
      value={money.convert(eur)}
      prefix={money.symbol}
    />
  );
}

/**
 * Small print explaining rupee conversions. Renders nothing in EUR, so it
 * only appears when it is relevant — transparency about the rate is part of
 * the brand promise.
 */
export function ConversionNote({ className }: { className?: string }) {
  const { currency } = useMoney();
  if (currency !== "MUR") return null;
  return (
    <p className={cn("text-xs text-ink-500", className)}>
      Rupee amounts are converted from euros at {conversionRateLabel()} for
      information.
    </p>
  );
}
