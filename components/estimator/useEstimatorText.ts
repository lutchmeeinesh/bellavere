"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useMoney } from "@/components/currency/CurrencyProvider";
import {
  ESTIMATOR_CONFIG,
  type Feature,
} from "@/data/estimator-config";
import type { AppLocale } from "@/i18n/routing";
import { roundForDisplay } from "@/lib/estimator";
import { formatNumber } from "@/lib/format";

/** Lists ("pool, sea view and beachfront") in British English / French. */
const LIST_LOCALE: Record<AppLocale, string> = { en: "en-GB", fr: "fr-FR" };

/**
 * Wording shared by the estimator's result, its WhatsApp message and the
 * contact-form summary, in the page's language and the visitor's currency.
 */
export function useEstimatorText() {
  const t = useTranslations("estimator");
  const money = useMoney();

  return useMemo(() => {
    /** An amount already in the display currency: "€39,300", "39 300 €", "Rs 2,050,000". */
    const amount = (value: number) =>
      `${money.affixes.prefix}${formatNumber(value, money.locale)}${money.affixes.suffix}`;

    return {
      amount,
      /** EUR → the display currency, rounded like every estimate figure. */
      display: (eur: number) => roundForDisplay(money.convert(eur)),
      /** EUR → rounded and formatted in the display currency. */
      estimateAmount: (eur: number) => amount(roundForDisplay(money.convert(eur))),
      /** "3 bedrooms", "6+ bedrooms". */
      bedrooms: (count: number) =>
        count >= ESTIMATOR_CONFIG.bedrooms.max
          ? t("bedrooms.countMax", { count: ESTIMATOR_CONFIG.bedrooms.max })
          : t("bedrooms.count", { count }),
      /** "private pool and sea view". */
      features: (features: readonly Feature[]) =>
        new Intl.ListFormat(LIST_LOCALE[money.locale], {
          type: "conjunction",
        }).format(features.map((feature) => t(`features.items.${feature}.inSentence`))),
      /** Weeks that mean "year-round". */
      isYearRound: (weeks: number) => weeks >= ESTIMATOR_CONFIG.weeks.yearRound,
    };
  }, [t, money]);
}
