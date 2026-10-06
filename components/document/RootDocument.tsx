import type { AbstractIntlMessages } from "next-intl";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { HtmlDocument } from "@/components/document/HtmlDocument";
import { IntlClientProvider } from "@/components/i18n/IntlClientProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { MESSAGE_FORMATS, TIME_ZONE, type AppLocale } from "@/i18n/routing";

/**
 * The document of the public site (app/[locale]/layout.tsx) and the owner
 * portal (app/(portal)/layout.tsx): the bare document (fonts, global CSS)
 * plus what client components need: translations (only the messages given,
 * see i18n/messages.ts), motion settings and the display currency.
 *
 * Nothing here reads cookies or headers, so the public pages are
 * prerendered and served from Vercel's edge cache. The owner and admin
 * portals read what they need per request in their own layouts.
 */
export function RootDocument({
  locale,
  messages,
  children,
}: {
  locale: AppLocale;
  /** Only the messages the document's shared client components need (i18n/messages.ts). */
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}) {
  return (
    <HtmlDocument locale={locale}>
      <IntlClientProvider
        locale={locale}
        messages={messages}
        formats={MESSAGE_FORMATS}
        timeZone={TIME_ZONE}
      >
        <MotionProvider>
          <CurrencyProvider locale={locale}>{children}</CurrencyProvider>
        </MotionProvider>
      </IntlClientProvider>
    </HtmlDocument>
  );
}
