import {
  Activity,
  CalendarDays,
  FileText,
  Lock,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DashboardPreview } from "@/components/home/DashboardPreview";
import { getClientById } from "@/data/clients";
import { formatMonthShort } from "@/lib/format";
import { kpisForClient, monthlyRevenueForClient } from "@/lib/metrics";

// Text: messages `home.dashboardTeaser.bullets.<id>`.
const BULLETS: {
  id: "live" | "calendar" | "maintenance" | "statements";
  icon: LucideIcon;
}[] = [
  { id: "live", icon: Activity },
  { id: "calendar", icon: CalendarDays },
  { id: "maintenance", icon: Wrench },
  { id: "statements", icon: FileText },
];

/** The demo owner (data/clients.ts) whose figures the preview shows. */
const DEMO_OWNER_ID = "c-sophie";

/**
 * Split section teasing the owner portal. The preview on the right renders
 * real figures from lib/metrics for the demo owner Sophie Laurent.
 */
export function DashboardTeaser() {
  const t = useTranslations("home.dashboardTeaser");
  const locale = useLocale();
  const kpis = kpisForClient(DEMO_OWNER_ID);
  // lib/metrics labels the months in English: relabel them in the page's
  // language here, on the server, so the browser renders the same text.
  const revenue = monthlyRevenueForClient(DEMO_OWNER_ID, 12).map((point) => ({
    ...point,
    label: formatMonthShort(new Date(point.year, point.month, 1), locale),
  }));
  // Only the two fields shown: the client record also holds login details.
  const client = getClientById(DEMO_OWNER_ID);
  const owner = {
    firstName: client?.shortName ?? "",
    initials: client?.initials ?? "",
  };

  return (
    <section className="bg-sand-100 py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow={t("eyebrow")}
              title={t("title")}
              sub={t("sub")}
            />
            <RevealStagger as="ul" className="mt-8 space-y-4">
              {BULLETS.map((bullet) => (
                <RevealItem
                  as="li"
                  key={bullet.id}
                  className="flex items-start gap-3.5"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                    <bullet.icon className="size-4" aria-hidden />
                  </span>
                  <p className="pt-1 text-ink-900">
                    {t(`bullets.${bullet.id}`)}
                  </p>
                </RevealItem>
              ))}
            </RevealStagger>
            <Reveal delay={0.2}>
              <p className="mt-7 flex items-start gap-2.5 text-sm text-ink-500">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                {t("ownFiguresOnly")}
              </p>
              <div className="mt-8">
                <Button href="/login" variant="dark">
                  {t("action")}
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} y={32}>
            <DashboardPreview kpis={kpis} revenue={revenue} owner={owner} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
