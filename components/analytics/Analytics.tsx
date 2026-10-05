import Script from "next/script";
import { PLAUSIBLE_DOMAIN } from "@/lib/analytics";

/** Plausible's script: page views (also on client-side navigations) and custom events. */
const PLAUSIBLE_SCRIPT = "https://plausible.io/js/script.js";

/**
 * Plausible's standard queue stub: events tracked before the script has
 * loaded are kept in window.plausible.q and sent once it arrives.
 */
const QUEUE_STUB =
  "window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}";

/**
 * Privacy-friendly analytics (Plausible) for the public site, rendered once
 * in the public root layout (app/[locale]/layout.tsx). Only when
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set at build time; otherwise nothing is
 * rendered and no request leaves for plausible.io. Plausible sets no cookies
 * and stores no personal data, so no consent banner is needed; the privacy
 * policy and the Content-Security-Policy (next.config.ts) follow the same
 * variable. Custom events: track() in lib/analytics.ts.
 */
export function Analytics() {
  if (!PLAUSIBLE_DOMAIN) return null;

  return (
    <>
      <Script id="plausible-queue" strategy="afterInteractive">
        {QUEUE_STUB}
      </Script>
      <Script
        src={PLAUSIBLE_SCRIPT}
        data-domain={PLAUSIBLE_DOMAIN}
        strategy="afterInteractive"
      />
    </>
  );
}
