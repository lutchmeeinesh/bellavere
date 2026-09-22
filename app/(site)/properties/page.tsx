import type { Metadata } from "next";
import { PortfolioExplorer } from "@/components/properties/PortfolioExplorer";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { properties } from "@/data/properties";
import { ConversionNote } from "@/components/currency/Money";

export const metadata: Metadata = {
  title: "Properties",
  description:
    "The Bellavere portfolio: villas and apartments across Mauritius, each photographed, priced and cared for by our team.",
};

export default function PropertiesPage() {
  return (
    <>
      <header className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="eyebrow mb-4">Our portfolio</p>
            <h1>Homes we manage as if they were our own</h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-500">
              A selection of the villas and apartments in our care — photographed,
              priced night by night and kept immaculate by the Bellavere team.
            </p>
            <p className="mt-3 text-sm text-ink-500 italic">
              Demo listings for illustration.
            </p>
            <ConversionNote className="mt-1" />
          </Reveal>
        </Container>
      </header>

      <section className="pt-12 pb-24 lg:pt-16 lg:pb-32">
        <Container>
          <PortfolioExplorer properties={properties} />
        </Container>
      </section>
    </>
  );
}
