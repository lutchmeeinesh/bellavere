import "server-only";
import { cookies } from "next/headers";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "@/lib/format";

/** The visitor's chosen display currency, read from the bv_currency cookie. */
export async function getCurrency(): Promise<Currency> {
  const store = await cookies();
  const value = store.get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : DEFAULT_CURRENCY;
}
