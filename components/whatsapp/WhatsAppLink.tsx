"use client";

import { useLocale } from "next-intl";
import { track } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/whatsapp";

/**
 * A link that opens a WhatsApp chat in a new tab (the app on phones) and
 * records a "WhatsApp Clicked" event with where it was clicked and the
 * page's language. A client component only for the click handler, so a
 * server component can render it with already-translated text:
 *
 *   <WhatsAppLink number={WHATSAPP_NUMBERS.ankit} message={t("prefill")}
 *     placement="contact-card" contact="ankit" aria-label={…}>…</WhatsAppLink>
 */
export function WhatsAppLink({
  number,
  message,
  placement,
  contact,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  /** wa.me format, from data/site.ts (WHATSAPP_NUMBERS). */
  number: string;
  /** Pre-filled text, already in the page's language. */
  message: string;
  /** Where the link sits, for analytics ("contact-card", …). */
  placement: string;
  /** Which person the chat is with (a contact id), for analytics. */
  contact?: string;
  className?: string;
  children: React.ReactNode;
  /** Accessible name; must contain the visible text. */
  "aria-label"?: string;
}) {
  const locale = useLocale();
  return (
    <a
      href={whatsappUrl(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() =>
        track("WhatsApp Clicked", {
          placement,
          locale,
          ...(contact ? { contact } : {}),
        })
      }
    >
      {children}
    </a>
  );
}
