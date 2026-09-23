import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";
import { siteImages } from "@/data/siteImages";

/** Inline animation-delay for the CSS entrance classes in globals.css. */
const delay = (seconds: number) => ({ animationDelay: `${seconds}s` });

/**
 * Full-viewport home hero. The fixed site header floats transparently over
 * it; the image runs the slow Ken Burns zoom and the text the entrance
 * animations defined in globals.css. Both are CSS, so the hero paints and
 * animates straight from the server HTML, before JavaScript loads.
 */
export function Hero() {
  const words = company.tagline.split(" ");

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-navy-900">
      <Image
        src={siteImages.homeHero.src}
        alt={siteImages.homeHero.alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="animate-kenburns object-cover"
      />
      {/* Dark navy gradient for text contrast over the photo */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/40 to-navy-900/75"
        aria-hidden
      />

      <Container className="relative z-10 pt-28 pb-24">
        <p className="eyebrow eyebrow-light animate-fade-in mb-6" style={delay(0.1)}>
          Property management &amp; syndic · Mauritius
        </p>

        <h1 className="max-w-3xl text-white">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="animate-rise inline-block [--rise-from:0.4em]"
              style={delay(0.25 + i * 0.05)}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>

        <p
          className="animate-rise mt-6 max-w-xl text-lg text-white/80"
          style={delay(0.55)}
        >
          We look after villas, apartments and residences all around
          Mauritius — no hidden fees, always a real person to
          answer you, and a live dashboard that shows exactly how your property
          is performing.
        </p>

        <div
          className="animate-rise mt-10 flex flex-wrap items-center gap-4"
          style={delay(0.7)}
        >
          <Button href="/contact" variant="primary" size="lg">
            List your property
          </Button>
          <Button href="/login" variant="light" size="lg">
            Owner login
          </Button>
        </div>
      </Container>

      {/* Subtle scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/60"
        aria-hidden
      >
        <ChevronDown className="animate-bob size-6" />
      </div>
    </section>
  );
}
