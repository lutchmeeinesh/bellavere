import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { EstimatorTeaser } from "@/components/home/EstimatorTeaser";
import { HowItWorks } from "@/components/home/HowItWorks";
import { DashboardTeaser } from "@/components/home/DashboardTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBand } from "@/components/home/CtaBand";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";

// The dashboard preview shows this month's figures: refresh them hourly.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const t = await getTranslations({ locale, namespace: "home.meta" });
  // No title: the layout's default title. The canonical URL is spelled out
  // by localizedMetadata ("/" or "/fr"), never "./": when Vercel regenerated
  // this page (ISR) it rendered it as "/index" (vercel/next.js#95648), which
  // would otherwise have become the canonical URL and og:url.
  return localizedMetadata({
    locale,
    path: "/",
    description: t("description"),
  });
}

export default async function HomePage({ params }: { params: LocaleParams }) {
  await getPageLocale(params);
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesOverview />
      <EstimatorTeaser />
      <HowItWorks />
      <DashboardTeaser />
      <Testimonials />
      <CtaBand withImage />
    </>
  );
}
