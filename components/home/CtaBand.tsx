import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { useSiteImages } from "@/lib/i18n/images";
import { cn } from "@/lib/utils";

/**
 * Full-width navy call-to-action band. `withImage` layers the lagoon photo
 * at low opacity beneath a navy overlay; `small` tightens the padding for
 * reuse on inner pages (About uses it). The default title and sub-line and
 * the button text are in messages (`home.ctaBand.*`); callers that pass
 * `title` / `sub` pass them already translated.
 */
export function CtaBand({
  title,
  sub,
  withImage = false,
  small = false,
}: {
  title?: string;
  sub?: string;
  withImage?: boolean;
  small?: boolean;
}) {
  const t = useTranslations("home.ctaBand");
  const images = useSiteImages();
  return (
    <section className="relative overflow-hidden bg-navy-900">
      {withImage ? (
        <>
          <Image
            src={images.finalCta.src}
            alt={images.finalCta.alt}
            fill
            sizes="100vw"
            // Drawn at 25% opacity under a navy overlay: low quality is invisible
            quality={40}
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-navy-900/70" aria-hidden />
        </>
      ) : null}
      <Container
        className={cn(
          "relative z-10 text-center",
          small ? "py-20 lg:py-24" : "py-24 lg:py-32"
        )}
      >
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-white">{title ?? t("title")}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
            {sub ?? t("sub")}
          </p>
          <div className="mt-9">
            <Button href="/contact" variant="primary" size="lg">
              {t("action")}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
