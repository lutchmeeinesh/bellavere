import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { company } from "@/data/company";

// Demo figures — sourced (and TODO-marked) in data/company.ts.
const STATS = [
  { value: company.stats.propertiesManaged, label: "Properties managed" },
  {
    value: company.stats.averageOccupancy,
    label: "Average occupancy",
    suffix: "%",
  },
  { value: company.stats.yearsOperating, label: "Years on the coast" },
  {
    value: company.stats.ownerRating,
    label: "Owner rating",
    suffix: "/5",
    decimals: 1,
  },
] as const;

/** Four key figures under the hero, counting up on reveal. */
export function TrustBar() {
  return (
    <section className="border-b border-sand-300 py-24 lg:py-32">
      <Container>
        <RevealStagger className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {STATS.map((stat) => (
            <RevealItem key={stat.label} className="text-center">
              <div className="font-serif text-5xl text-navy-900 lg:text-6xl">
                <CountUp
                  value={stat.value}
                  decimals={"decimals" in stat ? stat.decimals : 0}
                  suffix={"suffix" in stat ? stat.suffix : ""}
                />
              </div>
              <p className="eyebrow mt-3">{stat.label}</p>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  );
}
