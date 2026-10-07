import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { getAllMessages } from "@/i18n/messages";
import { MESSAGE_FORMATS, routing, TIME_ZONE } from "@/i18n/routing";

/**
 * next-intl's request configuration (wired in next.config.ts), used by
 * getTranslations / useTranslations / getLocale in server components.
 *
 * Public pages call setRequestLocale(locale) first, so the locale comes from
 * the [locale] segment and nothing reads request headers (the pages stay
 * static). An explicit `locale` (getTranslations({ locale, namespace }))
 * wins; anything else falls back to English, the portal's language.
 */
export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requested = locale ?? (await requestLocale);
  const resolved = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale: resolved,
    messages: getAllMessages(resolved),
    formats: MESSAGE_FORMATS,
    timeZone: TIME_ZONE,
  };
});
