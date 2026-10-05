import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Title and copy of each step: messages `home.howItWorks.steps.<id>`.
const STEPS = [
  { id: "onboard", number: "01" },
  { id: "manage", number: "02" },
  { id: "grow", number: "03" },
] as const;

/** Three-step horizontal timeline; stacks vertically on mobile. */
export function HowItWorks() {
  const t = useTranslations("home.howItWorks");
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          align="center"
        />
        <RevealStagger className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <RevealItem key={step.number}>
              <div className="flex items-center gap-4">
                <span className="font-serif text-5xl leading-none text-gold-500">
                  {step.number}
                </span>
                {/* Connecting line between steps (desktop only) */}
                {i < STEPS.length - 1 ? (
                  <span
                    className="hidden h-px flex-1 bg-sand-300 md:block"
                    aria-hidden
                  />
                ) : null}
              </div>
              <h3 className="mt-5">{t(`steps.${step.id}.title`)}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">
                {t(`steps.${step.id}.copy`)}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  );
}
