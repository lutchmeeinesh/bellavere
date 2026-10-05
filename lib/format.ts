import type { AppLocale } from "@/i18n/routing";

/**
 * Formatting helpers.
 *
 * Money: every amount in the data layer is stored in EUR. The site can
 * display either EUR or MUR (the visitor's choice, remembered in the
 * `bv_currency` cookie); MUR figures are converted at EUR_TO_MUR. Always
 * format money through these helpers, never with a hard-coded symbol.
 *
 * Language: every helper takes an optional `locale` ("en" when omitted, as
 * in the English-only owner portal). English output is exactly what it has
 * always been ("€24,960", "Rs 24,960", "29 Aug 2026"); French follows French
 * conventions: "24 960 €", "Rs 24 960" (rupees keep the "Rs" prefix, with
 * French digit grouping), "22 septembre 2026".
 */

export type Currency = "EUR" | "MUR";

export const CURRENCIES: readonly Currency[] = ["EUR", "MUR"];
export const DEFAULT_CURRENCY: Currency = "EUR";
export const CURRENCY_COOKIE = "bv_currency";

/**
 * Display conversion rate, EUR -> MUR.
 * Deliberately a whole number: every stored EUR amount is an integer, so
 * converted statement lines (gross - fee - expenses = net) still add up to
 * the rupee. If this becomes fractional, convert statement totals as a set.
 */
// Confirmed by the client (22 Sep 2026).
export const EUR_TO_MUR = 52;

export function isCurrency(value: unknown): value is Currency {
  return value === "EUR" || value === "MUR";
}

export function convertFromEur(eur: number, currency: Currency): number {
  return currency === "MUR" ? eur * EUR_TO_MUR : eur;
}

/** Intl locale for dates and plain numbers. */
const INTL_LOCALE: Record<AppLocale, string> = { en: "en-GB", fr: "fr-FR" };

const wholeFormatters: Record<Currency, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }),
  MUR: new Intl.NumberFormat("en-MU", {
    style: "currency",
    currency: "MUR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }),
};

const preciseFormatters: Record<Currency, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  MUR: new Intl.NumberFormat("en-MU", {
    style: "currency",
    currency: "MUR",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

// French: euros as "24 960 €"; rupees keep the "Rs" prefix used across the
// site, followed by French-grouped digits ("Rs 24 960").
const frenchFormatters = {
  EUR: new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }),
  EURPrecise: new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  whole: new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }),
  precise: new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

/** "€480" / "Rs 24,960" — whole units ("480 €" / "Rs 24 960" in French). */
export function formatMoney(
  eur: number,
  currency: Currency,
  locale: AppLocale = "en",
): string {
  const value = convertFromEur(eur, currency);
  if (locale === "fr") {
    return currency === "MUR"
      ? `${currencySymbol("MUR")}${frenchFormatters.whole.format(value)}`
      : frenchFormatters.EUR.format(value);
  }
  return wholeFormatters[currency].format(value);
}

/** "€480.00" / "Rs 24,960.00" ("480,00 €" / "Rs 24 960,00" in French) */
export function formatMoneyPrecise(
  eur: number,
  currency: Currency,
  locale: AppLocale = "en",
): string {
  const value = convertFromEur(eur, currency);
  if (locale === "fr") {
    return currency === "MUR"
      ? `${currencySymbol("MUR")}${frenchFormatters.precise.format(value)}`
      : frenchFormatters.EURPrecise.format(value);
  }
  return preciseFormatters[currency].format(value);
}

/**
 * Chart-axis style: "€12k" / "Rs 624k" / "Rs 1.2M" (French: "12 k€",
 * "Rs 624 k", "Rs 1,2 M").
 */
export function formatMoneyCompact(
  eur: number,
  currency: Currency,
  locale: AppLocale = "en",
): string {
  const value = convertFromEur(eur, currency);
  let amount: string;
  let unit = "";
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    amount = m >= 10 ? String(Math.round(m)) : m.toFixed(1);
    unit = "M";
  } else if (value >= 1000) {
    amount = String(Math.round(value / 1000));
    unit = "k";
  } else {
    amount = String(Math.round(value));
  }
  if (locale === "fr") {
    amount = amount.replace(".", ",");
    if (currency === "EUR") return `${amount}${NO_BREAK_SPACE}${unit}€`;
    return `${currencySymbol("MUR")}${amount}${unit ? NO_BREAK_SPACE + unit : ""}`;
  }
  return `${currencySymbol(currency)}${amount}${unit}`;
}

/**
 * Intl writes "Rs" followed by a no-break space; every hand-built rupee
 * string uses the same character so amounts look and wrap alike.
 */
const NO_BREAK_SPACE = String.fromCharCode(0xa0);

/** Prefix used by count-up figures: "€" / "Rs ". */
export function currencySymbol(currency: Currency): string {
  return currency === "MUR" ? `Rs${NO_BREAK_SPACE}` : "€";
}

/**
 * What goes before and after a number for a currency: "€" + "480" in
 * English, "480" + " €" in French; rupees are always "Rs " + number.
 */
export function currencyAffixes(
  currency: Currency,
  locale: AppLocale = "en",
): { prefix: string; suffix: string } {
  if (locale === "fr" && currency === "EUR") {
    return { prefix: "", suffix: `${NO_BREAK_SPACE}€` };
  }
  return { prefix: currencySymbol(currency), suffix: "" };
}

/** Human-readable rate, e.g. "€1 = Rs 52" ("1 € = Rs 52" in French). */
export function conversionRateLabel(locale: AppLocale = "en"): string {
  const rupees = `${currencySymbol("MUR")}${EUR_TO_MUR}`;
  return locale === "fr" ? `1${NO_BREAK_SPACE}€ = ${rupees}` : `€1 = ${rupees}`;
}

/** Plain number with the locale's digit grouping: "5,000" / "5 000". */
export function formatNumber(
  value: number,
  locale: AppLocale = "en",
  decimals = 0,
): string {
  return value.toLocaleString(INTL_LOCALE[locale], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Dates in the data layer are "yyyy-mm-dd" strings. `new Date()` would read
 * them as UTC midnight, which shows the previous day west of UTC and makes
 * browser-rendered dates disagree with the server's; read them as local
 * calendar dates instead.
 */
function toDate(date: Date | string): Date {
  if (typeof date !== "string") return date;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(date);
}

/** "29 Aug 2026" (French: "29 août 2026", month in full) */
export function formatDate(
  date: Date | string,
  locale: AppLocale = "en",
): string {
  const d = toDate(date);
  return d.toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: locale === "fr" ? "long" : "short",
    year: "numeric",
  });
}

/** "29 August 2026" / "29 août 2026" — e.g. "Last updated" lines. */
export function formatDateLong(
  date: Date | string,
  locale: AppLocale = "en",
): string {
  const d = toDate(date);
  return d.toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "29 Aug" ("29 août") */
export function formatDateShort(
  date: Date | string,
  locale: AppLocale = "en",
): string {
  const d = toDate(date);
  return d.toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
  });
}

/** "Fri 29 Aug" ("ven. 29 août") */
export function formatDateWeekday(
  date: Date | string,
  locale: AppLocale = "en",
): string {
  const d = toDate(date);
  return d.toLocaleDateString(INTL_LOCALE[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "August 2026" ("août 2026") */
export function formatMonth(
  date: Date | string,
  locale: AppLocale = "en",
): string {
  const d = toDate(date);
  return d.toLocaleDateString(INTL_LOCALE[locale], {
    month: "long",
    year: "numeric",
  });
}

/** "Aug" ("août") — chart and preview labels. */
export function formatMonthShort(
  date: Date | string,
  locale: AppLocale = "en",
): string {
  const d = toDate(date);
  return d.toLocaleDateString(INTL_LOCALE[locale], { month: "short" });
}

/** "81%" ("81 %" in French). */
export function formatPercent(
  value: number,
  decimals = 0,
  locale: AppLocale = "en",
): string {
  if (locale === "fr") {
    return `${formatNumber(value, "fr", decimals)}${String.fromCharCode(0x202f)}%`;
  }
  return `${value.toFixed(decimals)}%`;
}
