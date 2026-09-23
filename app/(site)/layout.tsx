import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/site/JsonLd";

// The public pages are prerendered and served from the edge cache. Reading
// cookies, headers or search params here would silently make every page
// dynamic again, so that fails the build instead.
export const dynamic = "error";
// Rebuilt at most daily in the background (keeps the footer's year current).
export const revalidate = 86400;

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
