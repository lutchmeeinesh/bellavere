import {
  ArrowRight,
  Building2,
  ConciergeBell,
  HeartHandshake,
  KeyRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";

interface Service {
  /** Title: messages `common.serviceNames.<id>`; copy: `home.services.items.<id>`. */
  id: "rental" | "maintenance" | "clientCare" | "concierge";
  icon: LucideIcon;
  href: string;
}

const SERVICES: Service[] = [
  { id: "rental", icon: KeyRound, href: "/services#rental" },
  { id: "maintenance", icon: Wrench, href: "/services#maintenance" },
  { id: "clientCare", icon: HeartHandshake, href: "/services#client-care" },
  { id: "concierge", icon: ConciergeBell, href: "/services#concierge" },
];

/**
 * Four lifted service cards linking to the anchored sections on /services,
 * plus a full-width syndic card for residences and developers.
 */
export function ServicesOverview() {
  const t = useTranslations("home.services");
  const tCommon = useTranslations("common");
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          sub={t("sub")}
        />
        <RevealStagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <RevealItem key={service.id}>
              <Link href={service.href} className="group block h-full">
                <Card lift className="flex h-full flex-col p-7">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                    <service.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5">
                    {tCommon(`serviceNames.${service.id}`)}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                    {t(`items.${service.id}`)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy-900 transition-colors duration-200 group-hover:text-gold-700">
                    {t("learnMore")}
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal delay={0.1} className="mt-6">
          <Link href="/services#syndic" className="group block">
            <div className="flex flex-col gap-6 rounded-2xl bg-navy-900 p-7 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-(--shadow-lift) sm:flex-row sm:items-center sm:justify-between lg:p-9">
              <div className="flex items-start gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-500">
                  <Building2 className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="eyebrow eyebrow-light">{t("syndic.eyebrow")}</p>
                  <h3 className="mt-2 text-white">{t("syndic.title")}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                    {t("syndic.copy")}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gold-500 transition-colors duration-200 group-hover:text-white">
                {t("learnMore")}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </div>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
