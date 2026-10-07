import { useTranslations } from "next-intl";

/**
 * Inline brand glyphs — lucide-react v1 no longer ships brand icons.
 * Sized/stroked to sit alongside lucide icons.
 */

type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M15.5 3h-2.75A3.75 3.75 0 0 0 9 6.75V10H6.5v3H9v8h3v-8h2.6l.65-3H12V7c0-.6.4-1 1-1h2.5z" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8.5h4V10a6 6 0 0 1 2-2z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

type SocialProfiles = {
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
};

/**
 * Social profiles that actually exist (non-null in data/company.ts), with
 * their icons. Empty until the client provides real links. The accessible
 * name is `common.social.<network>` ("Bellavere on Instagram"):
 *
 *   label={t(`social.${network}`, { company: company.name })}
 */
export function publishedSocialLinks(social: SocialProfiles) {
  const all = [
    { network: "instagram" as const, href: social.instagram, Icon: InstagramIcon },
    { network: "facebook" as const, href: social.facebook, Icon: FacebookIcon },
    { network: "linkedin" as const, href: social.linkedin, Icon: LinkedInIcon },
  ];
  return all.flatMap((link) =>
    link.href ? [{ ...link, href: link.href }] : [],
  );
}

/**
 * An icon link to a social profile. It opens in a new tab, and its
 * accessible name says so, since the icon itself is hidden from screen
 * readers.
 */
export function SocialLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  /** The profile, e.g. "Bellavere on Instagram" (already translated). */
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("common.social");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("newTab", { label })}
      className={className}
    >
      {children}
    </a>
  );
}
