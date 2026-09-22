/**
 * Formatting helpers.
 *
 * Money: every amount in the data layer is stored in EUR. The site can
 * display either EUR or MUR (the visitor's choice, remembered in the
 * `bv_currency` cookie); MUR figures are converted at EUR_TO_MUR. Always
 * format money through these helpers, never with a hard-coded symbol.
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

/** "€480" / "Rs 24,960" — whole units. */
export function formatMoney(eur: number, currency: Currency): string {
  return wholeFormatters[currency].format(convertFromEur(eur, currency));
}

/** "€480.00" / "Rs 24,960.00" */
export function formatMoneyPrecise(eur: number, currency: Currency): string {
  return preciseFormatters[currency].format(convertFromEur(eur, currency));
}

/** Chart-axis style: "€12k" / "Rs 624k" / "Rs 1.2M". */
export function formatMoneyCompact(eur: number, currency: Currency): string {
  const value = convertFromEur(eur, currency);
  const symbol = currencySymbol(currency);
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${symbol}${m >= 10 ? Math.round(m) : m.toFixed(1)}M`;
  }
  if (value >= 1000) return `${symbol}${Math.round(value / 1000)}k`;
  return `${symbol}${Math.round(value)}`;
}

/** Prefix used by count-up figures: "€" / "Rs ". */
export function currencySymbol(currency: Currency): string {
  return currency === "MUR" ? "Rs " : "€";
}

/** Human-readable rate, e.g. "€1 = Rs 52". */
export function conversionRateLabel(): string {
  return `€1 = Rs ${EUR_TO_MUR}`;
}

/** "29 Aug 2026" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "29 Aug" */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** "Fri 29 Aug" */
export function formatDateWeekday(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "August 2026" */
export function formatMonth(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** "Aug" */
export function formatMonthShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { month: "short" });
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
