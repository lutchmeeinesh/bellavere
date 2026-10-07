import { unsplash } from "@/lib/img";

/**
 * Shared marketing imagery (all photo IDs verified to resolve).
 *
 * Alt texts live in the messages, keyed by the same path as here:
 * `common.images.homeHero`, `common.images.services.rental`, ... Each one
 * describes what the photo actually shows; check the photo when changing
 * either. Components get { src, alt } through lib/i18n/images.ts:
 * `getSiteImages()` (async server components) or `useSiteImages()`.
 */
export const siteImages = {
  homeHero: { src: unsplash("1512917774080-9991f1c4c750", 2000) },
  loginBackdrop: { src: unsplash("1613490493576-7fde63acd811", 2000) },
  dashboardTeaser: { src: unsplash("1615571022219-eb45cf7faa9d", 1600) },
  finalCta: { src: unsplash("1505142468610-359e7d316be0", 2000) },
  services: {
    rental: { src: unsplash("1602343168117-bb8ffe3e2e9f", 1600) },
    maintenance: { src: unsplash("1540541338287-41700207dee6", 1600) },
    clientCare: { src: unsplash("1600607687939-ce8a6c25118c", 1600) },
    concierge: { src: unsplash("1571896349842-33c89424de2d", 1600) },
    syndic: { src: unsplash("1551882547-ff40c63fe5fa", 1600) },
  },
  about: {
    story: { src: unsplash("1507525428034-b723cf961d3e", 1600) },
    coast: { src: unsplash("1519046904884-53103b34b206", 1600) },
  },
} as const;
