import { Container } from "@/components/ui/Container";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    number: "01",
    title: "Onboard",
    copy: "We inspect and photograph your property, take care of licensing, and agree a pricing strategy built for your home and its season.",
  },
  {
    number: "02",
    title: "We manage",
    copy: "Guests welcomed, upkeep handled, statements prepared — one team runs the whole operation to hotel standards.",
  },
  {
    number: "03",
    title: "You watch it grow",
    copy: "Occupancy, revenue and maintenance, live on your owner dashboard — from Paris, London or the beach house next door.",
  },
];

/** Three-step horizontal timeline; stacks vertically on mobile. */
export function HowItWorks() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to an effortless property"
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
              <h3 className="mt-5">{step.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">
                {step.copy}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  );
}
