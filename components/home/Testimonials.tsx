"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 6000;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Draggable testimonial carousel. Auto-advances every 6s, pauses on hover
 * and focus, and never auto-advances under prefers-reduced-motion. Text:
 * messages `home.testimonials.*` (the order comes from data/testimonials.ts).
 */
export function Testimonials() {
  const t = useTranslations("home.testimonials");
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = testimonials.length;
  const goTo = (i: number) => setIndex(((i % count) + count) % count);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      AUTO_ADVANCE_MS
    );
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, count]);

  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -60 || info.velocity.x < -400) goTo(index + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) goTo(index - 1);
  };

  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          align="center"
        />

        <Reveal delay={0.1}>
          <div
            role="group"
            aria-roledescription={t("carousel.roleDescription")}
            aria-label={t("carousel.label")}
            className="mx-auto mt-12 max-w-3xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div className="overflow-hidden">
              <motion.div
                className="flex cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={onDragEnd}
                animate={{ x: `-${index * 100}%` }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.5, ease: EASE }
                }
              >
                {testimonials.map((testimonial, i) => (
                  <figure
                    key={testimonial.id}
                    aria-hidden={i !== index}
                    className="w-full shrink-0 px-2 text-center sm:px-8"
                  >
                    <span
                      className="font-serif text-7xl leading-none text-gold-500"
                      aria-hidden
                    >
                      &ldquo;
                    </span>
                    <blockquote className="mt-2">
                      <p className="font-serif text-2xl leading-snug text-navy-900 lg:text-3xl">
                        {t(`items.${testimonial.id}.quote`)}
                      </p>
                    </blockquote>
                    <figcaption className="mt-8">
                      <p className="font-medium text-ink-900">
                        {t(`items.${testimonial.id}.name`)}
                      </p>
                      <p className="mt-1 text-sm text-ink-500">
                        {t(`items.${testimonial.id}.role`)}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </motion.div>
            </div>

            {/* Controls */}
            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                type="button"
                aria-label={t("carousel.previous")}
                onClick={() => goTo(index - 1)}
                className="flex size-10 items-center justify-center rounded-full border border-sand-300 text-navy-900 transition-colors duration-200 hover:border-navy-900"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <div className="flex items-center gap-2.5">
                {testimonials.map((testimonial, i) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    aria-label={t("carousel.goTo", { index: i + 1, count })}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => goTo(i)}
                    className={cn(
                      "size-2 rounded-full transition-all duration-200",
                      i === index
                        ? "w-6 bg-gold-500"
                        : "bg-sand-300 hover:bg-gold-500/50"
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={t("carousel.next")}
                onClick={() => goTo(index + 1)}
                className="flex size-10 items-center justify-center rounded-full border border-sand-300 text-navy-900 transition-colors duration-200 hover:border-navy-900"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
