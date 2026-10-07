"use client";

import { SiteError } from "@/components/site/SiteError";

/**
 * Error boundary for the portal's root document: the sign-in page, and the
 * dashboard and admin layouts themselves (their pages have their own,
 * in-shell boundaries). English, like the rest of the portal.
 */
export default function PortalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SiteError {...props} />;
}
