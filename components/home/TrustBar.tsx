import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { company } from "@/data/company";

/**
 * Four commitments under the hero, counting up on reveal. These are promises
 * that are true by definition of the service (see data/company.ts). Swap in
 * track-record figures — properties managed, occupancy, ratings — only once
 * they are real.
 */
export function TrustBar() {
  return (
    <section className="border-b border-sand-300 py-24 lg:py-32">
      <Container>
        <RevealStagger className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {company.commitments.map((item) => (
            <RevealItem key={item.label} className="text-center">
              <div className="font-serif text-5xl text-navy-900 lg:text-6xl">
                <CountUp
                  value={item.value}
                  suffix={"suffix" in item ? item.suffix : ""}
                />
              </div>
              <p className="eyebrow mt-3">{item.label}</p>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  );
}
