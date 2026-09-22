import type { Testimonial } from "@/lib/types";

/**
 * Illustrative quotes. The client asked to keep this section, with names that
 * differ from the demo accounts. Initial-only surnames so no quote reads as
 * a specific real person.
 */
// Client decision (22 Sep 2026): keep these quotes as they are. They are
// illustrative, not from real owners — replace them if real quotes arrive.
export const testimonials: Testimonial[] = [
  {
    quote:
      "I live abroad and my villa is on the north coast, yet I always know exactly how it is doing. And when I call, a real person answers — every time.",
    name: "Élise M.",
    role: "Villa owner, living in France",
  },
  {
    quote:
      "No surprise charges. Every repair is on the statement with a line explaining it, and the fee was agreed face to face before we started.",
    name: "Deepak R.",
    role: "Apartment owner, west coast",
  },
  {
    quote:
      "As a residence we needed one reliable contact for the pool, the gardens and the contractors. That is exactly what we got.",
    name: "Nathalie C.",
    role: "Residence co-owner, north coast",
  },
];
