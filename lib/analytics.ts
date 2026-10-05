/**
 * Custom analytics events (Plausible). The script itself is added by
 * components/analytics/Analytics.tsx when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is
 * set; without it, track() does nothing.
 */
export type AnalyticsEvent =
  | "Estimator Completed"
  | "WhatsApp Clicked"
  | "Contact Submitted";

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventProps }) => void;
  }
}

/** Records an event if analytics is loaded; never throws. */
export function track(event: AnalyticsEvent, props?: EventProps): void {
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return;
  }
  try {
    window.plausible(event, props ? { props } : undefined);
  } catch {
    // Analytics must never break the page.
  }
}
