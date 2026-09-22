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
  /**
   * From the Certificate of Incorporation (Registrar of Companies,
   * Mauritius; CB No 82650 of 19/08/2026).
   */
  legalName: "Bellavere Ltd",
  companyNumber: "238321",
  /** ISO date of incorporation. */
  incorporated: "2026-08-19",
  companyType: "private company limited by shares",
  // TODO: confirm with client — tagline
  tagline: "Your property, perfectly managed.",
  /** Coverage confirmed by the client's own map (22 Sep 2026): island-wide. */
  market: "Across Mauritius",
  marketLong:
    "Villas, apartments and residences across Mauritius — north, west, east, south and the central plateau.",
  /**
   * Confirmed by the client (22 Sep 2026): the people to call, both
   * reachable every day, 24/7. Shown on the contact page and in structured
   * data. Ankit's and Nihal's emails are published at the client's request.
   */
  contacts: [
    {
      name: "Ankit Dookhorun",
      role: "Client Relations" as string | null,
      phone: "+230 5531 0734",
      email: "zoodookhorun@gmail.com" as string | null,
    },
    {
      name: "Nihal Lutchmee",
      role: null as string | null,
      phone: "+230 5817 4529",
      email: "executive@wwwbellavere.com" as string | null,
    },
  ],
  /** Main line (Ankit) for the footer and structured data. */
  phone: "+230 5531 0734" as string | null,
  hours: "Every day, 24/7" as string | null,
  /** Both contacts are reachable around the clock. */
  available247: true,
  /** Confirmed by the client: every query is answered the same day. */
  responseTime: "the same day",
  social: {
    instagram: "https://www.instagram.com/bellavere.ltd/" as string | null,
    facebook: "https://www.facebook.com/bellavere.ltd" as string | null,
    linkedin: null as string | null,
  },
  // TODO: confirm with client — registered address (for the legal pages)
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
  // Wording confirmed by the client as it stands (22 Sep 2026).
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
   * The people shown on the About page. Ankit's surname is confirmed by the
   * client, as is Krit's. No personal emails
   * here: this object is bundled into browser code, so anything in it is
   * public. Admin logins live server-side in data/admins.ts. Nihal's role
   * was not given, so none is shown.
   */
  // Surnames confirmed by the client (22 Sep 2026).
  // TODO: confirm with client — bio wording
  team: [
    {
      name: "Krit Goburdhan",
      role: "General Manager & Site Supervisor" as string | null,
      bio: "Runs Bellavere day to day and is on site in person — supervising maintenance, inspections and every contractor who works on your property.",
      initials: "KG",
    },
    {
      name: "Ankit Dookhorun",
      role: "Client Relations" as string | null,
      bio: "Your first point of contact for statements, bookings and questions — reachable every day, 24/7, and never a chatbot.",
      initials: "AD",
    },
    {
      name: "Nihal Lutchmee",
      role: null as string | null,
      bio: "Reachable every day, 24/7, on +230 5817 4529.",
      initials: "NL",
    },
  ],
  /**
   * Commitments shown in the home trust bar — each one confirmed by the
   * client. `value` counts up; `display` is shown as fixed text. Publish
   * track-record figures (properties managed, ratings) only once real.
   */
  commitments: [
    { value: 0, label: "Hidden fees" },
    { display: "24/7", label: "Always reachable" },
    { display: "Same day", label: "Every query answered" },
    { value: 100, suffix: "%", label: "Human answers, no bots" },
  ],
} as const;

export type Company = typeof company;
