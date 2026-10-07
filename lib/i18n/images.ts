import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { siteImages } from "@/data/siteImages";
import type { AppLocale } from "@/i18n/routing";

/**
 * The marketing photos of data/siteImages.ts with their alt text in the
 * current language (messages `common.images.<same path>`):
 *
 *   const images = await getSiteImages();          // async server component
 *   const images = useSiteImages();                // other components
 *   <Image src={images.services.rental.src} alt={images.services.rental.alt} … />
 */

type WithAlt<T> = T extends { src: string }
  ? { src: string; alt: string }
  : { [K in keyof T]: WithAlt<T[K]> };

export type SiteImages = WithAlt<typeof siteImages>;

function localize(
  tree: Record<string, unknown>,
  altFor: (id: string) => string,
  prefix = "",
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(tree).map(([key, value]) => {
      const id = prefix ? `${prefix}.${key}` : key;
      const node = value as Record<string, unknown>;
      return [
        key,
        typeof node.src === "string"
          ? { src: node.src, alt: altFor(id) }
          : localize(node, altFor, id),
      ];
    }),
  );
}

/** Async server components; `locale` only where no request locale is set. */
export async function getSiteImages(locale?: AppLocale): Promise<SiteImages> {
  const t = locale
    ? await getTranslations({ locale, namespace: "common.images" })
    : await getTranslations("common.images");
  // The ids are the paths of siteImages, which mirror the message keys.
  const altFor = t as unknown as (id: string) => string;
  return localize(siteImages, altFor) as SiteImages;
}

/** Non-async server components and client components. */
export function useSiteImages(): SiteImages {
  const t = useTranslations("common.images");
  const altFor = t as unknown as (id: string) => string;
  return localize(siteImages, altFor) as SiteImages;
}
