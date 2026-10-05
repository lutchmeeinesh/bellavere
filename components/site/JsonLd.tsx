import { useLocale, useTranslations } from "next-intl";
import { company } from "@/data/company";
import { PUBLIC_EMAIL, SITE_URL } from "@/data/site";
import { openGraphImagePath } from "@/lib/i18n/metadata";

// Wording: messages `common.jsonLd.services.<id>`.
const SERVICES = ["rental", "maintenance", "clientCare", "concierge", "syndic"] as const;

/**
 * Organization structured data, rendered once in the site layout, in the
 * page's language (names, descriptions and slogan; facts are shared).
 */
export function JsonLd() {
  const t = useTranslations("common");
  const locale = useLocale();
  const services = SERVICES.map((id) => ({
    name: t(`jsonLd.services.${id}.name`),
    description: t(`jsonLd.services.${id}.description`),
  }));

  const data = {
    "@context": "https://schema.org",
    // TODO: once company.registeredAddress is confirmed, switch back to
    // ["LocalBusiness", "ProfessionalService"] with a full PostalAddress
    // (streetAddress, addressLocality, addressCountry). Search engines expect
    // a street address on a LocalBusiness, so until then it is an Organization.
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: company.name,
    alternateName: company.tradingName,
    legalName: company.legalName,
    foundingDate: company.incorporated,
    identifier: {
      "@type": "PropertyValue",
      propertyID: t("jsonLd.companyNumber"),
      value: company.companyNumber,
    },
    url: SITE_URL,
    // public/logo.png: app/icon.svg rendered at 512 × 512 on navy.
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}${openGraphImagePath(locale)}`,
    email: PUBLIC_EMAIL,
    ...(company.phone ? { telephone: company.phone } : {}),
    slogan: t("company.tagline"),
    description: t("company.marketLong"),
    address: {
      "@type": "PostalAddress",
      addressCountry: "MU",
    },
    // Island-wide coverage, confirmed by the client's own map (22 Sep 2026).
    areaServed: { "@type": "Country", name: "Mauritius" },
    // No walk-in office, so no organisation-wide opening hours: the 24/7
    // availability belongs to the contact people (hoursAvailable below).
    contactPoint: company.contacts.map((person) => ({
      "@type": "ContactPoint",
      name: person.name,
      telephone: person.phone,
      ...(person.email ? { email: person.email } : {}),
      // schema.org vocabulary, not page text.
      contactType: "customer service",
      areaServed: "MU",
      ...(company.available247
        ? {
            hoursAvailable: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "00:00",
              closes: "23:59",
            },
          }
        : {}),
    })),
    sameAs: Object.values(company.social).filter(Boolean),
    knowsAbout: services.map((service) => service.name),
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        provider: { "@id": `${SITE_URL}/#organization` },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so no string in the data can close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
