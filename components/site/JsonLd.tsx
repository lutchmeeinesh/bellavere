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
    url: SITE_URL,
    email: company.email,
    telephone: company.phone,
    slogan: company.tagline,
    description: company.marketLong,
    address: {
      "@type": "PostalAddress",
      addressCountry: "MU",
    },
    // Island-wide coverage, confirmed by the client's own map (22 Sep 2026).
    areaServed: { "@type": "Country", name: "Mauritius" },
    sameAs: Object.values(company.social),
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
