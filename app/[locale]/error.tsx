"use client";

import { SiteError } from "@/components/site/SiteError";

/**
 * Error boundary for the public site: anything a page throws lands here,
 * in the page's language (the public root document stays around it).
 */
export default function LocaleError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SiteError {...props} />;
}
