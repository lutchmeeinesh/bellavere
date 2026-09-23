import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Bellavere — Property Management & Syndic Services in Mauritius",
    template: "%s · Bellavere",
  },
  description:
    "Bellavere looks after villas, apartments and residences across Mauritius: rentals, maintenance, syndic services, client care, concierge and a live owner dashboard.",
  // "./" resolves against metadataBase and each page's own path, so every
  // page gets its own absolute canonical URL and og:url.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "Bellavere",
    locale: "en_GB",
    url: "./",
  },
  twitter: { card: "summary_large_image" },
  // Keep the site out of search results until launch (see app/robots.ts).
  ...(process.env.SITE_INDEXABLE === "true"
    ? {}
    : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nothing here reads cookies or headers, so the public pages are
  // prerendered and served from Vercel's edge cache. The owner and admin
  // portals read what they need per request in their own layouts.
  return (
    // The font variables sit on <html> because the theme tokens that use
    // them (--font-serif, --font-sans) are defined on :root.
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
        <MotionProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
