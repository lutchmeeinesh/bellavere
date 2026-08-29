import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { DashboardTeaser } from "@/components/home/DashboardTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  description:
    "BellaVere manages luxury villas and apartments on the north and west coasts of Mauritius — rentals, maintenance, client care and concierge, with a live dashboard for every owner.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesOverview />
      <HowItWorks />
      <FeaturedProperties />
      <DashboardTeaser />
      <Testimonials />
      <CtaBand withImage />
    </>
  );
}
