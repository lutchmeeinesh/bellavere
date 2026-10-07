import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  Building2,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ComparisonTable } from "@/components/services/ComparisonTable";
import { ServiceSection } from "@/components/services/ServiceSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { company } from "@/data/company";
import { Link } from "@/i18n/navigation";
import { getSiteImages } from "@/lib/i18n/images";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const t = await getTranslations({ locale, namespace: "services.meta" });
  return localizedMetadata({
    locale,
    path: "/services",
    title: t("title"),
    description: t("description"),
  });
}

// Labels: messages `common.serviceNames.*` (the footer links use them too).
const ANCHORS = [
  { href: "#rental", service: "rental" },
  { href: "#maintenance", service: "maintenance" },
  { href: "#client-care", service: "clientCare" },
  { href: "#concierge", service: "concierge" },
  { href: "#syndic", service: "syndic" },
] as const;

/**
 * "What's included" items of each service, in display order; their text is
 * `services.sections.<service>.included.<id>`.
 */
const INCLUDED = {
  rental: [
    "listing",
    "bookings",
    "pricing",
    "guestCommunication",
    "checkInOut",
    "reporting",
  ],
  maintenance: [
    "repairs",
    "inspections",
    "renovation",
    "poolGarden",
    "cleaning",
    "emergencies",
    "contractors",
  ],
  clientCare: [
    "contact",
    "statements",
    "compliance",
    "insuranceUtilities",
    "issues",
  ],
  concierge: ["airportTransfers", "welcomePacks", "guestServices", "housekeeping"],
  syndic: [
    "commonAreas",
    "preventiveMaintenance",
    "poolLandscaping",
    "contractors",
    "security",
    "reporting",
  ],
} as const;

export default async function ServicesPage({
  params,
}: {
  params: LocaleParams;
}) {
  await getPageLocale(params);
  const t = await getTranslations("services");
  const tc = await getTranslations("common");
  const images = await getSiteImages();
  // Pricing wording is shared (messages `common.company.pricing.*`).
  const maxFee = company.pricing.maxFeeRate;
  const pricingModel = tc("company.pricing.model", { maxFee });
  const pricingDetail = tc("company.pricing.detail", { maxFee });
  return (
    <>
      <header className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="eyebrow mb-4">{t("hero.eyebrow")}</p>
            <h1>{t("hero.title")}</h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-500">
              {t("hero.intro", { pricingModel })}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {ANCHORS.map((anchor) => (
                <li key={anchor.href}>
                  <Link
                    href={anchor.href}
                    className="inline-block rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-ink-900 transition-colors duration-200 hover:border-gold-500 hover:text-navy-900"
                  >
                    {tc(`serviceNames.${anchor.service}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </header>

      <ServiceSection
        priority
        id="rental"
        eyebrow={t("sections.rental.eyebrow")}
        title={t("sections.rental.title")}
        image={images.services.rental}
        imageSide="left"
        paragraphs={[
          t("sections.rental.paragraphs.first"),
          t("sections.rental.paragraphs.second"),
        ]}
        included={INCLUDED.rental.map((item) =>
          t(`sections.rental.included.${item}`),
        )}
        detailIcon={MessageCircle}
        detail={t("sections.rental.detail")}
      />

      <ServiceSection
        id="maintenance"
        eyebrow={t("sections.maintenance.eyebrow")}
        title={t("sections.maintenance.title")}
        image={images.services.maintenance}
        imageSide="right"
        tinted
        paragraphs={[
          t("sections.maintenance.paragraphs.first"),
          t("sections.maintenance.paragraphs.second"),
        ]}
        included={INCLUDED.maintenance.map((item) =>
          t(`sections.maintenance.included.${item}`),
        )}
        detailIcon={ShieldCheck}
        detail={t("sections.maintenance.detail")}
      />

      <ServiceSection
        id="client-care"
        eyebrow={t("sections.clientCare.eyebrow")}
        title={t("sections.clientCare.title")}
        image={images.services.clientCare}
        imageSide="left"
        paragraphs={[
          t("sections.clientCare.paragraphs.first"),
          t("sections.clientCare.paragraphs.second"),
        ]}
        included={INCLUDED.clientCare.map((item) =>
          t(`sections.clientCare.included.${item}`),
        )}
        detailIcon={Phone}
        detail={t("sections.clientCare.detail")}
      />

      <ServiceSection
        id="concierge"
        eyebrow={t("sections.concierge.eyebrow")}
        title={t("sections.concierge.title")}
        image={images.services.concierge}
        imageSide="right"
        tinted
        paragraphs={[
          t("sections.concierge.paragraphs.first"),
          t("sections.concierge.paragraphs.second"),
        ]}
        included={INCLUDED.concierge.map((item) =>
          t(`sections.concierge.included.${item}`),
        )}
        detailIcon={Sparkles}
        detail={t("sections.concierge.detail")}
      />

      <ServiceSection
        id="syndic"
        eyebrow={t("sections.syndic.eyebrow")}
        title={t("sections.syndic.title")}
        image={images.services.syndic}
        imageSide="left"
        paragraphs={[
          t("sections.syndic.paragraphs.first"),
          t("sections.syndic.paragraphs.second"),
        ]}
        included={INCLUDED.syndic.map((item) =>
          t(`sections.syndic.included.${item}`),
        )}
        detailIcon={Building2}
        detail={t("sections.syndic.detail")}
      />

      <section className="py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow={t("atAGlance.eyebrow")}
            title={t("atAGlance.title")}
            sub={t("atAGlance.sub")}
            align="center"
            className="max-w-3xl"
          />
          <Reveal delay={0.1} className="mt-14">
            <ComparisonTable />
          </Reveal>
        </Container>
      </section>

      <section className="bg-navy-900 py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow={t("getStarted.eyebrow")}
            title={t("getStarted.title")}
            sub={pricingDetail}
            align="center"
            dark
          />
          <Reveal delay={0.15} className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/contact" size="lg">
              {tc("actions.listProperty")}
            </Button>
            <Button href="/login" variant="light" size="lg">
              {tc("actions.ownerLogin")}
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
