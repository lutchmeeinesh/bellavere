"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  ArrowRight,
  ChartLine,
  Info,
  KeyRound,
  MessageCircle,
  Pencil,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionNote } from "@/components/currency/Money";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { useWhatsAppOverride } from "@/components/whatsapp/WhatsAppProvider";
import { useEstimatorText } from "@/components/estimator/useEstimatorText";
import { ESTIMATOR_CONFIG } from "@/data/estimator-config";
import { WHATSAPP_PRIMARY } from "@/data/site";
import { track } from "@/lib/analytics";
import {
  contactSearchParams,
  displayBreakdown,
  estimateIncome,
  seasonDates,
  type EstimatorAnswers,
} from "@/lib/estimator";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";

// "How we'd get you there": messages `estimator.result.approach.items.<id>`.
const APPROACH = [
  { id: "rental", icon: KeyRound },
  { id: "care", icon: Wrench },
  { id: "reporting", icon: ChartLine },
] as const;

/**
 * The estimate: monthly and yearly gross income as count-up ranges in the
 * visitor's currency (follows the EUR/MUR switch live), the occupancy
 * assumption, the gross → fee → net breakdown, how Bellavere gets there and
 * the two calls to action. Never a single figure, never a guarantee.
 */
export function EstimateResult({
  answers,
  headingId,
  onChangeAnswers,
}: {
  answers: EstimatorAnswers;
  headingId: string;
  onChangeAnswers: () => void;
}) {
  const t = useTranslations("estimator");
  const money = useMoney();
  const text = useEstimatorText();
  const estimate = useMemo(() => estimateIncome(answers), [answers]);
  const yearRound = text.isYearRound(estimate.weeks);

  const monthly = {
    low: text.display(estimate.monthly.low),
    high: text.display(estimate.monthly.high),
  };
  const breakdown = displayBreakdown(estimate, money.convert);
  const annual = breakdown.gross;
  const rangeText = (range: { low: number; high: number }) =>
    t("result.range", {
      low: text.amount(range.low),
      high: text.amount(range.high),
    });

  const bedrooms = text.bedrooms(answers.bedrooms);
  const whatsappMessage = t("whatsappMessage", {
    type: answers.type,
    bedrooms,
    located: t(`regions.${answers.region}.located`),
    low: text.amount(annual.low),
    high: text.amount(annual.high),
  });
  // The floating button carries the same message while the result is shown.
  useWhatsAppOverride({ message: whatsappMessage });

  // Once per completed estimate (not on re-renders or currency changes).
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track("Estimator Completed", {
      type: answers.type,
      region: answers.region,
      bedrooms: answers.bedrooms,
      weeks: estimate.weeks,
    });
  }, [answers, estimate.weeks]);

  const contactHref = `/contact?${contactSearchParams(answers, estimate)}`;
  const maxFee = estimate.fee.rate;

  const summary = [
    t(`types.${answers.type}.name`),
    t(`regions.${answers.region}.name`),
    bedrooms,
    answers.features.length
      ? answers.features
          .map((feature) => t(`features.items.${feature}.label`))
          .join(" · ")
      : t("result.noFeatures"),
    yearRound
      ? t("result.yearRound")
      : t("availability.weeksPerYear", { weeks: estimate.weeks }),
  ];

  return (
    <div>
      <p className="eyebrow mb-3">{t("result.eyebrow")}</p>
      <h2
        id={headingId}
        tabIndex={-1}
        className="text-3xl outline-none sm:text-4xl"
      >
        {t("result.title")}
      </h2>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
        <ul aria-label={t("result.answersLabel")} className="flex flex-wrap gap-2">
          {summary.map((item, index) => (
            <li
              // A fixed list (type, region, bedrooms, features, weeks).
              key={index}
              className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-navy-900"
            >
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onChangeAnswers}
          className="inline-flex cursor-pointer items-center gap-1.5 py-1 text-sm font-medium text-navy-900 underline decoration-gold-500 underline-offset-4 transition-colors duration-200 hover:text-gold-700"
        >
          <Pencil className="size-3.5" aria-hidden />
          {t("result.change")}
        </button>
      </div>

      {/* The figures: always a range */}
      <div className="mt-8 grid overflow-hidden rounded-2xl bg-navy-900 sm:grid-cols-2">
        <FigureRange
          label={t("result.perMonth")}
          caption={t("result.gross")}
          range={monthly}
          srText={rangeText(monthly)}
        />
        <FigureRange
          label={t("result.perYear")}
          caption={t("result.gross")}
          range={annual}
          srText={rangeText(annual)}
          className="border-t border-white/10 sm:border-t-0 sm:border-l"
        />
      </div>

      <p className="mt-4 flex items-start gap-2.5 text-sm font-medium text-navy-900">
        <Info className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
        {t("result.disclaimer")}
      </p>
      <p className="mt-2 pl-6.5 text-sm leading-relaxed text-ink-500">
        {t("result.occupancy", {
          yearRound: yearRound ? "yes" : "no",
          occupancy: estimate.occupancy,
          weeks: estimate.weeks,
          high: ESTIMATOR_CONFIG.occupancy.high,
          low: ESTIMATOR_CONFIG.occupancy.low,
          ...seasonDates(),
        })}
      </p>
      <ConversionNote className="mt-2 pl-6.5" />

      {/* Gross → fee → net */}
      <section
        aria-labelledby={`${headingId}-breakdown`}
        className="mt-8 rounded-2xl border border-sand-300 p-5 sm:p-6"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 id={`${headingId}-breakdown`} className="text-xl">
            {t("result.breakdown.title")}
          </h3>
          <p className="eyebrow">{t("result.breakdown.period")}</p>
        </div>
        <dl className="mt-3 divide-y divide-sand-300">
          <BreakdownRow
            label={t("result.breakdown.gross")}
            value={rangeAmounts(breakdown.gross, text.amount)}
          />
          <BreakdownRow
            label={
              <>
                {t("result.breakdown.fee")}{" "}
                <span className="ml-1 inline-block rounded-full bg-gold-500/15 px-2 py-0.5 align-middle text-xs font-semibold text-gold-700">
                  {t("result.breakdown.feeCap", { maxFee })}
                </span>
              </>
            }
            qualifier={t("result.breakdown.upTo")}
            value={rangeAmounts(breakdown.fee, text.amount)}
          />
          <BreakdownRow
            strong
            label={t("result.breakdown.net")}
            qualifier={t("result.breakdown.atLeast")}
            value={rangeAmounts(breakdown.net, text.amount)}
          />
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          {t("result.breakdown.note", { maxFee })}
        </p>
      </section>

      {/* How we'd get you there */}
      <section aria-labelledby={`${headingId}-approach`} className="mt-10">
        <h3 id={`${headingId}-approach`} className="text-2xl">
          {t("result.approach.title")}
        </h3>
        <ul className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-5">
          {APPROACH.map((item) => (
            <li key={item.id}>
              <span className="flex size-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                <item.icon className="size-4.5" aria-hidden />
              </span>
              <p className="mt-3 font-medium text-navy-900">
                {t(`result.approach.items.${item.id}.title`)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">
                {t(`result.approach.items.${item.id}.copy`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Calls to action */}
      <div className="mt-10 flex flex-col gap-3 border-t border-sand-300 pt-8 sm:flex-row sm:flex-wrap sm:items-center">
        <Button href={contactHref} className="text-center">
          {t("result.cta.primary")}
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Button>
        {/* The wrapper records the click; the link itself is the shared Button. */}
        <span
          className="contents"
          onClick={() => track("WhatsApp Clicked", { placement: "estimator" })}
        >
          <Button
            href={whatsappUrl(WHATSAPP_PRIMARY, whatsappMessage)}
            target="_blank"
            variant="outline"
            className="text-center"
          >
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            {t("result.cta.whatsapp")}
            <span className="sr-only">{t("result.cta.newTab")}</span>
          </Button>
        </span>
      </div>
    </div>
  );
}

/** "€39,300 – €53,100": two amounts that never break inside. */
function rangeAmounts(
  range: { low: number; high: number },
  amount: (value: number) => string,
) {
  return (
    <>
      <span className="whitespace-nowrap">{amount(range.low)}</span>
      {" – "}
      <span className="whitespace-nowrap">{amount(range.high)}</span>
    </>
  );
}

function BreakdownRow({
  label,
  qualifier,
  value,
  strong = false,
}: {
  label: React.ReactNode;
  qualifier?: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6">
      <dt className={cn("text-sm", strong ? "font-semibold text-navy-900" : "text-ink-900")}>
        {label}
      </dt>
      <dd
        className={cn(
          "tabular-nums sm:text-right",
          strong ? "text-base font-semibold text-navy-900" : "text-sm font-medium text-navy-900",
        )}
      >
        {qualifier ? (
          <>
            <span className="text-xs font-normal text-ink-500">{qualifier}</span>{" "}
          </>
        ) : null}
        {value}
      </dd>
    </div>
  );
}

/** One headline figure: a count-up range, with the full range for screen readers. */
function FigureRange({
  label,
  caption,
  range,
  srText,
  className,
}: {
  label: string;
  caption: string;
  range: { low: number; high: number };
  srText: string;
  className?: string;
}) {
  return (
    <div className={cn("p-6 sm:p-7", className)}>
      <p className="eyebrow eyebrow-light">{label}</p>
      <p className="mt-3 font-serif text-3xl leading-tight font-semibold text-white lining-nums lg:text-[2.25rem]">
        <span className="sr-only">{srText}</span>
        <span aria-hidden className="flex flex-wrap items-baseline gap-x-2">
          <CountedAmount value={range.low} />
          <span className="text-gold-500">–</span>
          <CountedAmount value={range.high} />
        </span>
      </p>
      <p className="mt-2 text-sm text-white/70">{caption}</p>
    </div>
  );
}

/**
 * A count-up amount in the display currency. The final text, invisible,
 * reserves the width so the line never reflows while the digits run.
 */
function CountedAmount({ value }: { value: number }) {
  const money = useMoney();
  const text = useEstimatorText();
  return (
    <span className="inline-grid whitespace-nowrap tabular-nums">
      <span className="invisible col-start-1 row-start-1">{text.amount(value)}</span>
      <span className="col-start-1 row-start-1">
        <CountUp
          // Restart the count when the currency flips.
          key={`${money.currency}-${value}`}
          value={value}
          prefix={money.affixes.prefix}
          suffix={money.affixes.suffix}
          locale={money.locale}
          duration={1.4}
        />
      </span>
    </span>
  );
}
