import { PUBLIC_EMAIL } from "@/data/site";

/**
 * Single source of truth for company facts used across the site.
 *
 * Confirmed by the client (September 2026): company name, team members and
 * roles, company email, mission, and dual MUR/EUR pricing. Service scope
 * (incl. syndic) comes from the client's own prospect-list outreach copy.
 * Everything still marked "TODO: confirm with client" is demo copy.
 *
 * Facts only (names, numbers, phones, links, ids). Every sentence about the
 * company is in messages/<locale>.json under `common.company.*` (tagline,
 * coverage, mission, company type, pricing wording, team roles and bios,
 * commitments, hours, response time, country), in English and French. The
 * English-only owner portal reads `hours` below.
 */

export const company = {
  /** Brand name as the client writes it. */
  name: "Bellavere",
  /** Trading name used on the client's own outreach material. */
  tradingName: "Bellavere Property Care",
  /**
   * From the Certificate of Incorporation (Registrar of Companies,
   * Mauritius; CB No 82650 of 19/08/2026): a private company limited by
   * shares (messages `common.company.companyType`).
   */
  legalName: "Bellavere Ltd",
  companyNumber: "238321",
  /** ISO date of incorporation. */
  incorporated: "2026-08-19",
  // TODO: confirm with client — tagline (messages `common.company.tagline`)
  // Coverage confirmed by the client's own map (22 Sep 2026): island-wide
  // (messages `common.company.marketLong`).
  /**
   * Confirmed by the client (22 Sep 2026): the people to call, both
   * reachable every day, 24/7. Shown on the contact page and in structured
   * data. Ankit's and Nihal's emails are published at the client's request.
   */
  contacts: [
    {
      /** Key of this person in messages (`common.company.team.<id>`). */
      id: "ankit",
      name: "Ankit Dookhorun",
      role: "Client Relations" as string | null,
      phone: "+230 5531 0734",
      email: "zoodookhorun@gmail.com" as string | null,
    },
    {
      id: "nihal",
      name: "Nihal Lutchmee",
      role: null as string | null,
      phone: "+230 5817 4529",
      email: "executive@wwwbellavere.com" as string | null,
    },
  ],
  /** Main line (Ankit) for the footer and structured data. */
  phone: "+230 5531 0734" as string | null,
  /**
   * English wording for the portal; public pages: messages
   * `common.company.hoursInline` (mid-sentence). Null hides every
   * "Call us — …" hint.
   */
  hours: "Every day, 24/7" as string | null,
  /** Both contacts are reachable around the clock. */
  available247: true,
  // Confirmed by the client: every query is answered the same day (messages
  // `common.company.responseTime`).
  social: {
    instagram: "https://www.instagram.com/bellavere.ltd/" as string | null,
    facebook: "https://www.facebook.com/bellavere.ltd" as string | null,
    linkedin: null as string | null,
  },
  // TODO: confirm with client — registered address (for the legal pages)
  registeredAddress: null as string | null,
  /** Always PUBLIC_EMAIL (data/site.ts); kept here for older call sites. */
  email: PUBLIC_EMAIL,
  // No walk-in office: only the country is published (messages
  // `common.company.country`; the ISO code "MU" in structured data).
  // The client's mission, in their own words: messages `common.company.mission`.
  /**
   * Confirmed by the client: the fee is negotiated and set after the first
   * meeting, and never exceeds 15%. Each owner's agreed rate lives on their
   * record (Client.feeRate) and drives their statements.
   */
  // Wording confirmed by the client as it stands (22 Sep 2026): messages
  // `common.company.pricing.*`, with the rate as `{maxFee, number, percent}`.
  pricing: {
    maxFeeRate: 0.15,
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
  // Roles and bios: messages `common.company.team.<id>.role|bio` (Krit:
  // General Manager & Site Supervisor; Ankit: Client Relations; Nihal: none).
  team: [
    { id: "krit", name: "Krit Goburdhan", initials: "KG" },
    { id: "ankit", name: "Ankit Dookhorun", initials: "AD" },
    { id: "nihal", name: "Nihal Lutchmee", initials: "NL" },
  ],
  /**
   * Commitments shown in the home trust bar — each one confirmed by the
   * client. `value` counts up; `display: true` shows fixed text instead
   * ("24/7", "Same day"). Publish track-record figures (properties managed,
   * ratings) only once real.
   */
  // Wording: `common.company.commitments.<id>.label` (and `.display`).
  commitments: [
    { id: "hiddenFees", value: 0 },
    { id: "reachable", display: true },
    { id: "sameDay", display: true },
    { id: "human", value: 100, suffix: "%" },
  ],
} as const;

export type Company = typeof company;
