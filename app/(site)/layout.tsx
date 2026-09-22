import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/site/JsonLd";

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
