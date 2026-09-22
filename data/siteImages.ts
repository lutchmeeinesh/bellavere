import { unsplash } from "@/lib/img";

/** Shared marketing imagery (all photo IDs verified to resolve). */
export const siteImages = {
  homeHero: {
    src: unsplash("1512917774080-9991f1c4c750", 2000),
    alt: "Contemporary white villa and pool in tropical sunshine",
  },
  loginBackdrop: {
    src: unsplash("1613490493576-7fde63acd811", 2000),
    alt: "Contemporary villa with a long pool in bright sunshine",
  },
  dashboardTeaser: {
    src: unsplash("1615571022219-eb45cf7faa9d", 1600),
    alt: "Contemporary beach house perched above breaking waves",
  },
  finalCta: {
    src: unsplash("1505142468610-359e7d316be0", 2000),
    alt: "Aerial view of a wave breaking on white sand",
  },
  services: {
    rental: {
      src: unsplash("1602343168117-bb8ffe3e2e9f", 1600),
      alt: "Contemporary white villa with a long swimming pool",
    },
    maintenance: {
      src: unsplash("1540541338287-41700207dee6", 1600),
      alt: "Infinity pool framed by palm trees above the ocean",
    },
    clientCare: {
      src: unsplash("1600607687939-ce8a6c25118c", 1600),
      alt: "Modern open-plan living room with a pale sofa and timber feature wall",
    },
    concierge: {
      src: unsplash("1571896349842-33c89424de2d", 1600),
      alt: "Resort pool reflecting warm lights at dusk",
    },
    syndic: {
      src: unsplash("1551882547-ff40c63fe5fa", 1600),
      alt: "Low-rise white residence with a shared pool and palm trees at dusk",
    },
  },
  about: {
    story: {
      src: unsplash("1507525428034-b723cf961d3e", 1600),
      alt: "Calm beach at sunrise with gentle waves",
    },
    coast: {
      src: unsplash("1519046904884-53103b34b206", 1600),
      alt: "White-sand beach with a palm tree and a thatched parasol",
    },
  },
} as const;
