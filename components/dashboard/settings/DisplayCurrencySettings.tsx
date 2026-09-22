"use client";

import { Card } from "@/components/ui/Card";
import { CurrencyToggle } from "@/components/currency/CurrencyToggle";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { conversionRateLabel } from "@/lib/format";

/** Choose whether the site and dashboard show amounts in EUR or MUR. */
export function DisplayCurrencySettings() {
  const money = useMoney();
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl">Display currency</h2>
          <p className="mt-1 text-sm text-ink-500">
            How amounts appear across the website and your dashboard.
          </p>
        </div>
        <CurrencyToggle layoutId="currency-pill-settings" />
      </div>
      <p className="mt-5 rounded-xl border border-sand-300 bg-sand-50 px-4 py-3.5 text-sm text-ink-500">
        Figures are recorded in euros. Rupee amounts are converted at{" "}
        {conversionRateLabel()} — for example, {money.format(1000)} in your
        current currency equals €1,000.
      </p>
    </Card>
  );
}
