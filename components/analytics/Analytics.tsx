/**
 * Privacy-friendly analytics (Plausible) for the public site, rendered once
 * in the public root layout. Phase 1 stream B adds the script here when
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set (and extends the Content-Security-
 * Policy in next.config.ts and the privacy policy to match); custom events
 * go through track() in lib/analytics.ts.
 *
 * Placeholder until then: renders nothing.
 */
export function Analytics() {
  return null;
}
