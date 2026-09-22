import { company } from "@/data/company";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const SERVICES = [
  {
    name: "Rental management",
    description:
      "Holiday-rental management for villas and apartments: listings, pricing, bookings and guest communication.",
  },
  {
    name: "Maintenance",
    description:
      "Property maintenance, inspections and supervision of contractors.",
  },
  {
    name: "Client care",
    description:
      "A dedicated human point of contact for owners, with transparent monthly statements.",
  },
  {
    name: "Concierge",
    description: "Concierge services for owners and their guests.",
  },
  {
    name: "Syndic & residence management",
    description:
      "Syndic and residence management for co-owned buildings and residences.",
  },
];

/** Organization / LocalBusiness structured data, rendered once in the site layout. */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Organization"],
    "@id": `${SITE_URL}/#organization`,
    name: company.name,
    alternateName: company.tradingName,
    legalName: company.legalName,
    foundingDate: company.incorporated,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "Company number (Registrar of Companies, Mauritius)",
      value: company.companyNumber,
    },
    url: SITE_URL,
    email: company.email,
    ...(company.phone ? { telephone: company.phone } : {}),
    slogan: company.tagline,
    description: company.marketLong,
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
    knowsAbout: SERVICES.map((service) => service.name),
    makesOffer: SERVICES.map((service) => ({
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
