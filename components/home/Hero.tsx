"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";
import { siteImages } from "@/data/siteImages";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Full-viewport home hero. The fixed site header floats transparently over
 * it; the image runs the slow Ken Burns zoom defined in globals.css.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const words = company.tagline.split(" ");

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-navy-900">
      <Image
        src={siteImages.homeHero.src}
        alt={siteImages.homeHero.alt}
        fill
        priority
        sizes="100vw"
        className="animate-kenburns object-cover"
      />
      {/* Dark navy gradient for text contrast over the photo */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/40 to-navy-900/75"
        aria-hidden
      />

      <Container className="relative z-10 pt-28 pb-24">
        <motion.p
          className="eyebrow eyebrow-light mb-6"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          Property management &amp; syndic · Mauritius
        </motion.p>

        <h1 className="max-w-3xl text-white">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="inline-block"
              initial={reduceMotion ? undefined : { opacity: 0, y: "0.4em" }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.05, ease: EASE }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mt-6 max-w-xl text-lg text-white/80"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
        >
          We look after villas, apartments and residences across the north and
          west coasts of Mauritius — no hidden fees, always a real person to
          answer you, and a live dashboard that shows exactly how your property
          is performing.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
        >
          <Button href="/contact" variant="primary" size="lg">
            List your property
          </Button>
          <Button href="/login" variant="light" size="lg">
            Owner login
          </Button>
        </motion.div>
      </Container>

      {/* Subtle scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/60"
        aria-hidden
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={
          reduceMotion ? undefined : { opacity: 1, y: [0, 8, 0] }
        }
        transition={{
          opacity: { duration: 0.6, delay: 1.2 },
          y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
        }}
      >
        <ChevronDown className="size-6" />
      </motion.div>
    </section>
  );
}
