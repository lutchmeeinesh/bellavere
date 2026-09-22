import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { getCurrency } from "@/lib/currency";
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
    default: "Bellavere — Villa & Apartment Management in Mauritius",
    template: "%s · Bellavere",
  },
  description:
    "Bellavere manages villas, apartments and residences on the north and west coasts of Mauritius: rentals, maintenance, syndic services, client care, concierge and a live owner dashboard.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading the currency cookie here renders every page in the visitor's
  // chosen currency from the first paint (it also makes routes dynamic).
  const currency = await getCurrency();

  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} antialiased`}>
        <MotionProvider>
          <CurrencyProvider initialCurrency={currency}>
            {children}
          </CurrencyProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
