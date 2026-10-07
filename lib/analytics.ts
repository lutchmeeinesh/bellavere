/**
 * Privacy-friendly analytics (Plausible: no cookies, no personal data),
 * switched on by NEXT_PUBLIC_PLAUSIBLE_DOMAIN — the site's domain as
 * registered in Plausible, e.g. "www.bellaveremu.com". Read at build time
 * (Next.js inlines NEXT_PUBLIC_ variables), so changing it needs a redeploy.
 *
 * With the variable set:
 *  - components/analytics/Analytics.tsx loads Plausible's script on the
 *    public site (page views, including client-side navigations);
 *  - next.config.ts lets https://plausible.io through the
 *    Content-Security-Policy (script-src and connect-src);
 *  - the privacy policy describes the analytics (messages
 *    `analytics.privacy.*`).
 * Without it, nothing is loaded, track() does nothing and the privacy policy
 * says the site uses no analytics.
 *
 * Custom events (Plausible → Site settings → Goals → "Custom event", one
 * goal per name below; their props appear under the goal):
 *  - "WhatsApp Clicked"     { placement: "floating" | "contact-card" | …, locale, … }
 *  - "Estimator Completed"  sent by the estimator's result screen
 *  - "Contact Submitted"    sent by the contact form after a successful send
 */
export type AnalyticsEvent =
  | "Estimator Completed"
  | "WhatsApp Clicked"
  | "Contact Submitted";

type EventProps = Record<string, string | number | boolean>;

type PlausibleFunction = ((
  event: string,
  options?: { props?: EventProps },
) => void) & { q?: unknown[] };

declare global {
  interface Window {
    plausible?: PlausibleFunction;
  }
}

/** The Plausible site domain, or null when analytics is off. */
export const PLAUSIBLE_DOMAIN =
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || null;

/** True when the site measures its audience (see above). */
export const ANALYTICS_ENABLED = PLAUSIBLE_DOMAIN !== null;

/**
 * The date the privacy policy gained its analytics wording: its "Last
 * updated" date, and its sitemap date, while analytics is on.
 */
export const ANALYTICS_POLICY_DATE = "2026-10-05";

/**
 * Records a custom event. Events sent before Plausible's script has loaded
 * wait in the standard `window.plausible.q` queue (the same stub
 * Analytics.tsx installs), which the script replays once it arrives. Does
 * nothing when analytics is off or on the server; never throws.
 */
export function track(event: AnalyticsEvent, props?: EventProps): void {
  if (!ANALYTICS_ENABLED || typeof window === "undefined") return;
  try {
    if (typeof window.plausible !== "function") {
      const queue: PlausibleFunction = (...args) => {
        (queue.q = queue.q ?? []).push(args);
      };
      window.plausible = queue;
    }
    window.plausible(event, props ? { props } : undefined);
  } catch {
    // Analytics must never break the page.
  }
}
