import Link from "next/link";
import { cn } from "@/lib/utils";

/** Bellavere wordmark: small gold lozenge + Cormorant wordmark. */
export function Logo({
  dark = false,
  href = "/",
  className,
}: {
  /** dark = for use on dark backgrounds (white text). */
  dark?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500",
        className
      )}
      aria-label="Bellavere — home"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        aria-hidden
        className="shrink-0"
      >
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
        Bellavere
      </span>
    </Link>
  );
}
