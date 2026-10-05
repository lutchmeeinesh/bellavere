import type { AbstractIntlMessages } from "next-intl";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { IntlClientProvider } from "@/components/i18n/IntlClientProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { TIME_ZONE, type AppLocale } from "@/i18n/routing";
import "@/app/globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The <html> document shared by every root layout: the public site
 * (app/[locale]/layout.tsx), the owner portal (app/(portal)/layout.tsx) and
 * the bare 404 (app/not-found.tsx). One component, so fonts, providers and
 * global CSS cannot drift between them.
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
  /** Only the namespaces client components need (i18n/messages.ts). */
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}) {
  return (
    // The font variables sit on <html> because the theme tokens that use
    // them (--font-serif, --font-sans) are defined on :root.
    <html lang={locale} className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
        <IntlClientProvider
          locale={locale}
          messages={messages}
          timeZone={TIME_ZONE}
        >
          <MotionProvider>
            <CurrencyProvider locale={locale}>{children}</CurrencyProvider>
          </MotionProvider>
        </IntlClientProvider>
      </body>
    </html>
  );
}
