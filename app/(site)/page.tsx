import type { Metadata } from "next";
import { OPEN_GRAPH_BASE } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { DashboardTeaser } from "@/components/home/DashboardTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBand } from "@/components/home/CtaBand";

// The dashboard preview shows this month's figures: refresh them hourly.
export const revalidate = 3600;

export const metadata: Metadata = {
  // Spelled out rather than "./": when Vercel regenerates this page (ISR) it
  // renders it as "/index" (vercel/next.js#95648), which would otherwise
  // become the canonical URL and og:url.
  alternates: { canonical: "/" },
  openGraph: { ...OPEN_GRAPH_BASE, url: "/" },
  description:
    "Bellavere manages luxury villas and apartments across Mauritius — rentals, maintenance, client care and concierge, with a live dashboard for every owner.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesOverview />
      <HowItWorks />
      <DashboardTeaser />
      <Testimonials />
      <CtaBand withImage />
    </>
  );
}
