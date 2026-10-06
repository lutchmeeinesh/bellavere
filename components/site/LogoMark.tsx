import { company } from "@/data/company";
import { cn } from "@/lib/utils";

/**
 * The Bellavere wordmark itself: small gold lozenge + Cormorant name, no
 * link and no hooks, so server components without client JavaScript (the
 * 404 page) can render it inside their own link. The usual linked logo is
 * components/site/Logo.tsx.
 */
export function LogoMark({ dark = false }: { dark?: boolean }) {
  return (
    <>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0">
        <rect
          x="9"
          y="0.5"
          width="12"
          height="12"
          rx="1.5"
          transform="rotate(45 9 0.5)"
          fill="var(--gold-500)"
        />
        <rect
          x="9"
          y="4.6"
          width="6.2"
          height="6.2"
          rx="1"
          transform="rotate(45 9 4.6)"
          fill={dark ? "var(--navy-900)" : "var(--sand-50)"}
        />
      </svg>
      <span
        className={cn(
          "font-serif text-2xl font-semibold tracking-wide",
          dark ? "text-white" : "text-navy-900"
        )}
      >
        {company.name}
      </span>
    </>
  );
}

/** The classes of the logo's link (Logo and the 404 page's plain link). */
export const LOGO_LINK_CLASSES =
  "inline-flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500";
