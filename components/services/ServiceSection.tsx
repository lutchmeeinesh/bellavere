import Image from "next/image";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/**
 * Full-width service section: image on one side, copy + "What's included"
 * checklist + a gold detail chip on the other. Sides alternate down the
 * services page via `imageSide`; `tinted` swaps the background to sand-100
 * for editorial rhythm.
 */
export function ServiceSection({
  id,
  eyebrow,
  title,
  image,
  imageSide = "left",
  tinted = false,
  paragraphs,
  included,
  detailIcon: DetailIcon,
  detail,
  priority = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  image: { src: string; alt: string };
  imageSide?: "left" | "right";
  tinted?: boolean;
  paragraphs: string[];
  included: string[];
  detailIcon: IconComponent;
  detail: React.ReactNode;
  /** Set on the first section: its photo is the page's largest early image. */
  priority?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-24 lg:py-32", tinted && "bg-sand-100")}
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className={cn(imageSide === "right" && "lg:order-2")}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={priority}
                fetchPriority={priority ? "high" : undefined}
                sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className={cn(imageSide === "right" && "lg:order-1")}>
            <Reveal>
              <p className="eyebrow mb-4">{eyebrow}</p>
              <h2>{title}</h2>
            </Reveal>

            <Reveal delay={0.08}>
              {paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="mt-5 leading-relaxed text-ink-500"
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-9 text-xs font-semibold tracking-(--tracking-label) text-navy-900 uppercase">
                What&rsquo;s included
              </p>
            </Reveal>
            <RevealStagger
              as="ul"
              className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2"
            >
              {included.map((item) => (
                <RevealItem
                  as="li"
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-ink-900"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-gold-700"
                    aria-hidden
                  />
                  {item}
                </RevealItem>
              ))}
            </RevealStagger>

            <Reveal delay={0.15}>
              <div className="mt-9 inline-flex items-center gap-4 rounded-2xl border border-gold-500/40 bg-gold-500/5 px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-700">
                  <DetailIcon className="size-5" aria-hidden />
                </span>
                <p className="text-sm font-medium text-navy-900">{detail}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
