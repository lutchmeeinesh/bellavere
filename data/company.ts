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
  /** Coverage confirmed by the client's own map (22 Sep 2026): island-wide. */
  market: "Across Mauritius",
  marketLong:
    "Villas, apartments and residences across Mauritius — north, west, east, south and the central plateau.",
  /**
   * Not yet provided by the client, so not shown anywhere. Fill these in and
   * the contact page, footer and structured data pick them up automatically.
   */
  // TODO: confirm with client — phone, office hours, social links,
  // registered address (for the legal pages)
  phone: null as string | null,
  hours: null as string | null,
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
    linkedin: null as string | null,
  },
  registeredAddress: null as string | null,
  email: "BellavereLtd@gmail.com",
  /** No walk-in office: only the country is published. */
  address: { country: "Mauritius" },
  /** The client's mission, in their own words. */
  mission:
    "Our mission is to provide the best service while maintaining full transparency. No hidden fees — and there will always be a human to answer you.",
  /**
   * Confirmed by the client: the fee is negotiated and set after the first
   * meeting, and never exceeds 15%. Each owner's agreed rate lives on their
   * record (Client.feeRate) and drives their statements.
   */
  // TODO: confirm with client — the 15% cap is assumed to be of gross
  // rental income (syndic contracts may be priced differently)
  pricing: {
    maxFeeRate: 0.15,
    /** Short form for badges and lists. */
    short: "Negotiable — never more than 15%",
    /** Reads naturally after "for" or "is". */
    model: "a fee agreed with you after our first meeting, never more than 15% of gross rental income",
    detail:
      "Your management fee is negotiated with you and set after our first meeting — it never exceeds 15% of gross rental income. No hidden fees: every cost is itemised on your monthly statement.",
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
