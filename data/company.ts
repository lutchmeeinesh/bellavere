/**
 * Single source of truth for company facts used across the site.
 *
 * Confirmed by the client (September 2026): company name, team members and
 * roles, company email, mission, and dual MUR/EUR pricing. Service scope
 * (incl. syndic) comes from the client's own prospect-list outreach copy.
 * Everything still marked "TODO: confirm with client" is demo copy.
 */

export const company = {
  /** Brand name as the client writes it. */
  name: "Bellavere",
  /** Trading name used on the client's own outreach material. */
  tradingName: "Bellavere Property Care",
  // TODO: confirm with client — registered legal name (inferred from the
  // company email address) and Business Registration Number (BRN)
  legalName: "Bellavere Ltd",
  // TODO: confirm with client — tagline
  tagline: "Your property, perfectly managed.",
  market: "North & west coast, Mauritius",
  marketLong:
    "Villas, apartments and residences from Grand Gaube to Rivière Noire, on the north and west coasts of Mauritius.",
  // TODO: confirm with client — phone
  phone: "+230 5 728 4410",
  email: "BellavereLtd@gmail.com",
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
  /** The client's mission, in their own words. */
  mission:
    "Our mission is to provide the best service while maintaining full transparency. No hidden fees — and there will always be a human to answer you.",
  // TODO: confirm with client — pricing model (the fee rate also drives the
  // owner-statement maths in lib/metrics.ts)
  pricing: {
    model: "18% of gross rental income",
    detail:
      "One clearly stated management fee of 18% of gross rental income. No hidden fees — every cost is itemised on your monthly statement.",
    feeRate: 0.18,
  },
  /**
   * The team. Surnames are inferred from the team's email addresses.
   * `email` is kept for internal use (e.g. routing enquiries) and is NOT
   * rendered on the public site — personal addresses attract spam.
   */
  // TODO: confirm with client — surname spelling and bio wording
  team: [
    {
      name: "Krit Goburdhan",
      role: "General Manager & Site Supervisor",
      bio: "Runs Bellavere day to day and is on site in person — supervising maintenance, inspections and every contractor who works on your property.",
      initials: "KG",
      email: "Kritgoburdhan@gmail.com",
    },
    {
      name: "Ankit Zoodookhorun",
      role: "Client Relations",
      bio: "Your first point of contact for statements, bookings and questions — answered by a person who knows your property, never a chatbot.",
      initials: "AZ",
      email: "zoodookhorun@gmail.com",
    },
  ],
  /**
   * Commitments shown in the home trust bar. These are true by definition of
   * the service, unlike track-record figures (properties managed, years
   * operating, ratings), which should only be published once real.
   */
  commitments: [
    { value: 0, label: "Hidden fees" },
    { value: 1, label: "Point of contact" },
    { value: 2, label: "Currencies — MUR & EUR" },
    { value: 100, suffix: "%", label: "Human answers, no bots" },
  ],
} as const;

export type Company = typeof company;
