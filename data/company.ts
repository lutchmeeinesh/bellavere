/**
 * Single source of truth for company facts used across the site.
 * Everything marked "TODO: confirm with client" is realistic demo copy
 * standing in for a placeholder in the brief — see README for the full list.
 */

export const company = {
  name: "BellaVere",
  // TODO: confirm with client — tagline
  tagline: "Your property, perfectly managed.",
  // TODO: confirm with client — location / market
  market: "North & west coast, Mauritius",
  marketLong:
    "Villas and apartments from Grand Baie to Rivière Noire, on the north and west coasts of Mauritius.",
  // TODO: confirm with client — founding year
  founded: 2016,
  // TODO: confirm with client — phone
  phone: "+230 5 728 4410",
  // TODO: confirm with client — email
  email: "hello@bellavere.mu",
  // TODO: confirm with client — address
  address: {
    line1: "Suite 4, La Croisette Business Centre",
    line2: "Grand Baie 30510",
    country: "Mauritius",
  },
  // TODO: confirm with client — office hours
  hours: "Monday – Saturday, 8:30 – 17:30 (GMT+4)",
  // TODO: confirm with client — social links
  social: {
    instagram: "https://instagram.com/bellavere.mu",
    facebook: "https://facebook.com/bellavere.mu",
    linkedin: "https://linkedin.com/company/bellavere",
  },
  // TODO: confirm with client — mission / story
  mission:
    "BellaVere exists so that owning a home on the coast of Mauritius feels effortless from anywhere in the world. We combine hotel-grade guest service with meticulous property care and complete financial transparency, so every owner knows exactly how their property is performing — down to the last rupee or euro.",
  // TODO: confirm with client — pricing model
  pricing: {
    model: "18% of gross rental income",
    detail:
      "One transparent management fee of 18% of gross rental income. No onboarding fee, no fixed monthly charges, no mark-up on contractor invoices.",
    feeRate: 0.18,
  },
  // TODO: confirm with client — team members & bios
  team: [
    {
      name: "Isabelle Verlaine",
      role: "Founder & Managing Director",
      bio: "Fifteen years in luxury hospitality across Mauritius and the Seychelles before founding BellaVere in 2016.",
      initials: "IV",
    },
    {
      name: "Marc Duval",
      role: "Head of Property Care",
      bio: "Former resort chief engineer; leads inspections, maintenance and our network of vetted contractors.",
      initials: "MD",
    },
    {
      name: "Priya Ramgoolam",
      role: "Head of Guest Experience",
      bio: "Runs reservations, concierge and housekeeping — the team your guests will rave about.",
      initials: "PR",
    },
  ],
  // Demo stats used in the home trust bar.
  // TODO: confirm with client — real figures
  stats: {
    propertiesManaged: 68,
    averageOccupancy: 81,
    yearsOperating: 10,
    ownerRating: 4.9,
  },
} as const;

export type Company = typeof company;
