import Image from "next/image";
import type { PropertyImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Asymmetric detail-page gallery: the first image takes a large 2x2 cell on
 * desktop, the rest fill an adjacent grid whose spans adapt to how many
 * photos the property has (data carries 3–5 per property).
 */
export function PropertyGallery({ images }: { images: PropertyImage[] }) {
  const featured = images[0];
  const rest = images.slice(1);

  if (!featured) return null;

  const desktopSpan = (index: number): string => {
    if (rest.length <= 2) return "lg:col-span-2";
    if (rest.length === 3) return index === 0 ? "lg:col-span-2" : "lg:col-span-1";
    return "lg:col-span-1";
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <div
        className={cn(
          "relative col-span-2 aspect-[4/3] overflow-hidden rounded-2xl",
          rest.length >= 2 && "lg:row-span-2 lg:aspect-auto"
        )}
      >
        <Image
          src={featured.src}
          alt={featured.alt}
          fill
          priority
          sizes="(min-width: 1024px) 600px, 100vw"
          className="object-cover"
        />
      </div>
      {rest.map((image, index) => {
        const lastAndOdd =
          index === rest.length - 1 && rest.length % 2 === 1;
        return (
          <div
            key={image.src + image.alt}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-2xl",
              lastAndOdd ? "col-span-2" : "col-span-1",
              desktopSpan(index)
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 300px, 50vw"
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
