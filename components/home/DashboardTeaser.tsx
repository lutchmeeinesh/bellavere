import {
  Activity,
  CalendarDays,
  FileText,
  Lock,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DashboardPreview } from "@/components/home/DashboardPreview";
import { kpisForClient, monthlyRevenueForClient } from "@/lib/metrics";

const BULLETS: { icon: LucideIcon; text: string }[] = [
  {
    icon: Activity,
    text: "Real-time occupancy and revenue, updated with every booking",
  },
  { icon: CalendarDays, text: "Bookings and the guest calendar at a glance" },
  { icon: Wrench, text: "Maintenance status, from first report to resolution" },
  { icon: FileText, text: "Monthly statements, itemised and ready to download" },
];

/**
 * Split section teasing the owner portal. The preview on the right renders
 * real figures from lib/metrics for the demo owner Sophie Laurent.
 */
export function DashboardTeaser() {
  const kpis = kpisForClient("c-sophie");
  const revenue = monthlyRevenueForClient("c-sophie", 12);

  return (
    <section className="bg-sand-100 py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="The owner portal"
              title="Your portfolio, live"
              sub="No more waiting for the end-of-season phone call. Your dashboard shows how your property is performing, the moment anything changes."
            />
            <RevealStagger as="ul" className="mt-8 space-y-4">
              {BULLETS.map((bullet) => (
                <RevealItem
                  as="li"
                  key={bullet.text}
                  className="flex items-start gap-3.5"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                    <bullet.icon className="size-4" aria-hidden />
                  </span>
                  <p className="pt-1 text-ink-900">{bullet.text}</p>
                </RevealItem>
              ))}
            </RevealStagger>
            <Reveal delay={0.2}>
              <p className="mt-7 flex items-start gap-2.5 text-sm text-ink-500">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                Every owner sees only their own properties — your figures stay
                yours, and yours alone.
              </p>
              <div className="mt-8">
                <Button href="/login" variant="dark">
                  See the owner portal
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} y={32}>
            <DashboardPreview kpis={kpis} revenue={revenue} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
