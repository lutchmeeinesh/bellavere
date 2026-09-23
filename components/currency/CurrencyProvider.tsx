"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  convertFromEur,
  currencySymbol,
  formatMoney,
  formatMoneyCompact,
  formatMoneyPrecise,
  isCurrency,
  type Currency,
} from "@/lib/format";

/**
 * The display currency lives in the bv_currency cookie, which is the single
 * source of truth: every provider reads it, and a change is announced to the
 * other providers on the page (event) and in other tabs (BroadcastChannel).
 */
const CHANGE_EVENT = "bv:currency";
const CHANNEL_NAME = "bv-currency";

function readCurrencyCookie(): Currency {
  for (const part of document.cookie.split(";")) {
    const [name, value] = part.trim().split("=");
    if (name === CURRENCY_COOKIE && isCurrency(value)) return value;
  }
  return DEFAULT_CURRENCY;
}

function writeCurrencyCookie(next: Currency) {
  document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(next);
    channel.close();
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  // A page restored from the back/forward cache may have missed a change.
  window.addEventListener("pageshow", onChange);
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(CHANNEL_NAME)
      : null;
  if (channel) channel.onmessage = onChange;
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("pageshow", onChange);
    channel?.close();
  };
}

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (next: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Holds the display currency.
 *
 * - Public pages are static, so the root layout cannot read the cookie: its
 *   provider renders in the default currency on the server and switches to
 *   the visitor's choice as the page hydrates (only the home page's
 *   dashboard preview, below the fold, shows money).
 * - The owner and admin portals are rendered per request: their layouts read
 *   the cookie and pass `initialCurrency`, so the first paint is already in
 *   the right currency (no flash, no hydration mismatch). Whenever the
 *   choice moves away from what the server rendered (a switch here, in
 *   another tab, or on the public site), they refresh their server
 *   components, which format some amounts on the server.
 */
export function CurrencyProvider({
  initialCurrency,
  children,
}: {
  /** The cookie value read on the server; set by per-request layouts only. */
  initialCurrency?: Currency;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const currency = useSyncExternalStore(
    subscribe,
    readCurrencyCookie,
    () => initialCurrency ?? DEFAULT_CURRENCY
  );

  // Portals only: re-render the server components in the new currency. The
  // ref stops a refresh loop if the server ever renders a different value.
  const lastRefreshed = useRef(initialCurrency);
  useEffect(() => {
    if (initialCurrency === undefined) return;
    if (currency !== initialCurrency && lastRefreshed.current !== currency) {
      lastRefreshed.current = currency;
      router.refresh();
    }
  }, [currency, initialCurrency, router]);

  const setCurrency = useCallback((next: Currency) => {
    writeCurrencyCookie(next);
  }, []);

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

/** Currency-aware money helpers for client components. */
export function useMoney() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useMoney must be used inside <CurrencyProvider>");
  const { currency, setCurrency } = ctx;

  return useMemo(
    () => ({
      currency,
      setCurrency,
      /** "€480" / "Rs 24,960" */
      format: (eur: number) => formatMoney(eur, currency),
      /** "€480.00" / "Rs 24,960.00" */
      formatPrecise: (eur: number) => formatMoneyPrecise(eur, currency),
      /** "€12k" / "Rs 624k" */
      formatCompact: (eur: number) => formatMoneyCompact(eur, currency),
      convert: (eur: number) => convertFromEur(eur, currency),
      symbol: currencySymbol(currency),
    }),
    [currency, setCurrency]
  );
}
