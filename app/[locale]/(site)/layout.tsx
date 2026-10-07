import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/site/JsonLd";
import { LocaleBanner } from "@/components/site/LocaleBanner";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { WhatsAppProvider } from "@/components/whatsapp/WhatsAppProvider";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";

// The public pages are prerendered and served from the edge cache. Reading
// cookies, headers or search params here would silently make every page
// dynamic again, so that fails the build instead.
export const dynamic = "error";
// Rebuilt at most daily in the background (keeps the footer's year current).
export const revalidate = 86400;

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: LocaleParams;
}) {
  await getPageLocale(params);

  return (
    <WhatsAppProvider>
      <div className="flex min-h-screen flex-col">
        <JsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <LocaleBanner />
      </div>
    </WhatsAppProvider>
  );
}
