import { unsplash } from "@/lib/img";

/** Shared marketing imagery (all photo IDs verified to resolve). */
export const siteImages = {
  homeHero: {
    src: unsplash("1512917774080-9991f1c4c750", 2000),
    alt: "Luxury villa with an illuminated pool at dusk on the Mauritian coast",
  },
  loginBackdrop: {
    src: unsplash("1613490493576-7fde63acd811", 2000),
    alt: "Villa terrace and pool lit warmly at night",
  },
  dashboardTeaser: {
    src: unsplash("1615571022219-eb45cf7faa9d", 1600),
    alt: "Villa pool terrace overlooking the ocean",
  },
  finalCta: {
    src: unsplash("1544551763-46a013bb70d5", 2000),
    alt: "Aerial view of a turquoise lagoon and reef",
  },
  services: {
    rental: {
      src: unsplash("1602343168117-bb8ffe3e2e9f", 1600),
      alt: "Hillside villa with a long pool overlooking the bay",
    },
    maintenance: {
      src: unsplash("1540541338287-41700207dee6", 1600),
      alt: "Palm-fringed pool being kept immaculate",
    },
    clientCare: {
      src: unsplash("1600607687939-ce8a6c25118c", 1600),
      alt: "Calm open-plan villa interior kept in perfect order",
    },
    concierge: {
      src: unsplash("1571896349842-33c89424de2d", 1600),
      alt: "Resort pool with folded towels ready for guests",
    },
  },
  about: {
    story: {
      src: unsplash("1507525428034-b723cf961d3e", 1600),
      alt: "Quiet tropical beach with clear turquoise water",
    },
    coast: {
      src: unsplash("1519046904884-53103b34b206", 1600),
      alt: "White-sand beach shaded by palms",
    },
  },
} as const;
