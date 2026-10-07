import { Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { WHATSAPP_COLOR_VARS, WhatsAppIcon } from "@/components/whatsapp/WhatsAppIcon";
import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";
import { company } from "@/data/company";
import { WHATSAPP_NUMBERS } from "@/data/site";
import type { Messages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

type Team = Messages["common"]["company"]["team"];
/**
 * People whose role is worded in messages (`common.company.team.<id>.role`).
 * data/company.ts gives a contact a role only if they have one there.
 */
type RoleId = {
  [Id in keyof Team]: Team[Id] extends { role: string } ? Id : never;
}[keyof Team];

type ContactId = (typeof company.contacts)[number]["id"];

// The site's pill buttons (components/ui/Button.tsx), as plain links: these
// need their own aria-label, rel and click tracking.
const BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-200 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";
/** WhatsApp, the primary action: the "dark" button with the glyph in WhatsApp green. */
const WHATSAPP_BUTTON = cn(
  BUTTON_CLASSES,
  "bg-navy-900 text-white hover:bg-navy-700",
);
/** Phone call, the secondary action: the "outline" button. */
const CALL_BUTTON = cn(
  BUTTON_CLASSES,
  "border border-navy-900/25 text-navy-900 hover:border-navy-900 hover:bg-navy-900 hover:text-white",
);

/**
 * The people to contact (Ankit and Nihal, `company.contacts`), one card
 * each, for the contact page: a WhatsApp chat (primary), a phone call and
 * their email. Numbers come from data/site.ts (WhatsApp) and
 * data/company.ts (phone); each chat opens with a greeting to that person
 * in the page's language, and clicks are recorded as "WhatsApp Clicked"
 * with placement "contact-card".
 */
export function WhatsAppContactCards({ className }: { className?: string }) {
  const t = useTranslations("whatsapp.contactCards");
  const tc = useTranslations("common");

  return (
    // data-whatsapp-avoid: the floating button steps aside while the cards
    // are behind it (they offer the same chats; on phones it would cover
    // their buttons' right ends).
    <ul
      className={cn("space-y-3", className)}
      style={WHATSAPP_COLOR_VARS}
      data-whatsapp-avoid
    >
      {company.contacts.map((person) => {
        const id: ContactId = person.id;
        const firstName = person.name.split(" ")[0];
        const initials = company.team.find((member) => member.id === id)?.initials;
        return (
          <li
            key={id}
            className="rounded-2xl border border-sand-300 bg-white p-5 sm:p-6"
          >
            <div className="flex items-center gap-3.5">
              {initials ? (
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-900 font-serif text-lg text-gold-500"
                  aria-hidden
                >
                  {initials}
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="font-serif text-xl leading-tight font-semibold text-navy-900">
                  {person.name}
                </p>
                {person.role ? (
                  <p className="mt-0.5 text-sm text-ink-500">
                    {tc(`company.team.${id as RoleId}.role`)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <WhatsAppLink
                number={WHATSAPP_NUMBERS[id]}
                message={t("prefill", { name: firstName })}
                placement="contact-card"
                contact={id}
                aria-label={tc("social.newTab", {
                  label: t("whatsappLabel", { name: firstName }),
                })}
                className={WHATSAPP_BUTTON}
              >
                <WhatsAppIcon className="size-4.5 text-(--wa-green)" />
                {t("whatsapp")}
              </WhatsAppLink>
              <a
                href={`tel:${person.phone.replace(/\s/g, "")}`}
                aria-label={t("callLabel", { name: firstName, phone: person.phone })}
                className={CALL_BUTTON}
              >
                <Phone className="size-4" aria-hidden />
                {person.phone}
              </a>
            </div>

            {person.email ? (
              <a
                href={`mailto:${person.email}`}
                className="mt-4 inline-flex max-w-full items-center gap-2 py-0.5 text-sm/5 text-ink-500 transition-colors duration-150 hover:text-gold-700"
              >
                <Mail className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  {person.email}
                </span>
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
