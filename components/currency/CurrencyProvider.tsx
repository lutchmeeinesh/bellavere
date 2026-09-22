"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CURRENCY_COOKIE,
  convertFromEur,
  currencySymbol,
  formatMoney,
  formatMoneyCompact,
  formatMoneyPrecise,
  type Currency,
} from "@/lib/format";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (next: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Holds the display currency. The root layout reads the bv_currency cookie
 * on the server and passes it in, so the first paint is already in the right
 * currency (no flash, no hydration mismatch). Changing it updates client
 * components instantly, persists the cookie for a year, and refreshes server
 * components so everything re-renders in the new currency.
 */
export function CurrencyProvider({
  initialCurrency,
  children,
}: {
  initialCurrency: Currency;
  children: React.ReactNode;
}) {
  const [currency, setState] = useState<Currency>(initialCurrency);
  const router = useRouter();

  const setCurrency = useCallback(
    (next: Currency) => {
      setState(next);
      document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router]
  );

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
