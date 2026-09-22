import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { siteImages } from "@/data/siteImages";
import { cn } from "@/lib/utils";

/**
 * Full-width navy call-to-action band. `withImage` layers the lagoon photo
 * at low opacity beneath a navy overlay; `small` tightens the padding for
 * reuse on inner pages (About uses it).
 */
export function CtaBand({
  title = "Let your island home work beautifully",
  sub = "Tell us about your property and we'll show you, openly, what it could achieve.",
  withImage = false,
  small = false,
}: {
  title?: string;
  sub?: string;
  withImage?: boolean;
  small?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      {withImage ? (
        <>
          <Image
            src={siteImages.finalCta.src}
            alt={siteImages.finalCta.alt}
            fill
            sizes="100vw"
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
          <h2 className="mx-auto max-w-2xl text-white">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">{sub}</p>
          <div className="mt-9">
            <Button href="/contact" variant="primary" size="lg">
              Start the conversation
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
