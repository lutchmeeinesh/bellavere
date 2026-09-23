import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "@/lib/format";

/**
 * The visitor's chosen display currency, read from the bv_currency cookie.
 * Only the per-request portals (dashboard, admin) call this; the public
 * pages are static and read the cookie in the browser instead.
 */
export const getCurrency = cache(async (): Promise<Currency> => {
  const store = await cookies();
  const value = store.get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : DEFAULT_CURRENCY;
});
