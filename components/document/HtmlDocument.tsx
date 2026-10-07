import { Cormorant_Garamond, Inter } from "next/font/google";
import type { AppLocale } from "@/i18n/routing";
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
 * The bare <html> document: language, fonts and global CSS. Every root
 * document is built on it, so fonts and global CSS cannot drift between
 * them. Pages with client components use RootDocument (this plus the client
 * providers); app/not-found.tsx, which has none, uses it directly, so the
 * 404 boundary every route carries loads no client JavaScript.
 */
export function HtmlDocument({
  locale,
  children,
}: {
  locale: AppLocale;
  children: React.ReactNode;
}) {
  return (
    // The font variables sit on <html> because the theme tokens that use
    // them (--font-serif, --font-sans) are defined on :root.
    // data-scroll-behavior: globals.css scrolls smoothly; this tells Next.js
    // to switch that off during route changes (asked for since Next.js 15.5).
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
