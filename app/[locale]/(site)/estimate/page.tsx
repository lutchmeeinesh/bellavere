import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Percent, SunMedium, Tag } from "lucide-react";
import { EstimatorFlow } from "@/components/estimator/EstimatorFlow";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ESTIMATOR_CONFIG } from "@/data/estimator-config";
import { seasonDates } from "@/lib/estimator";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const t = await getTranslations({ locale, namespace: "estimator.meta" });
  return localizedMetadata({
    locale,
    path: "/estimate",
    title: t("title"),
    description: t("description"),
  });
}

// "How the estimate works": messages `estimator.method.items.<id>`.
const METHOD = [
  { id: "rates", icon: Tag },
  { id: "occupancy", icon: SunMedium },
  { id: "fees", icon: Percent },
] as const;

export default async function EstimatePage({
  params,
}: {
  params: LocaleParams;
}) {
  await getPageLocale(params);
  const t = await getTranslations("estimator");
  const { occupancy, rangeSpread, maxFeeRate } = ESTIMATOR_CONFIG;
  const values = {
    high: occupancy.high,
    low: occupancy.low,
    maxFee: maxFeeRate,
    ...seasonDates(),
  };

  return (
    <>
      {/* Page header */}
      <div className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-4">{t("header.eyebrow")}</p>
            <h1>{t("header.title")}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-500">{t("header.intro")}</p>
          </Reveal>
        </Container>
      </div>

      {/* The estimator: the first question is in the server HTML */}
      <section aria-label={t("flow.label")} className="pt-12 pb-24 lg:pt-14 lg:pb-32">
        <Container>
          <EstimatorFlow />
        </Container>
      </section>

      {/* How the estimate works */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow={t("method.eyebrow")}
            title={t("method.title")}
            sub={t("method.sub", { spread: rangeSpread })}
            align="center"
          />
          <RevealStagger className="mt-14 grid gap-6 md:grid-cols-3">
            {METHOD.map((item) => (
              <RevealItem key={item.id}>
                <Card className="h-full p-8">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5">{t(`method.items.${item.id}.title`)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    {t(`method.items.${item.id}.copy`, values)}
                  </p>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </section>
    </>
  );
}
