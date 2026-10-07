import { useTranslations } from "next-intl";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { company } from "@/data/company";

type TeamId = (typeof company.team)[number]["id"];

/**
 * Message key of a person's role (`common.company.team.<id>.role`). Nihal's
 * role was not given, so his messages have none and none is shown.
 */
function roleKey(id: TeamId) {
  return id === "nihal" ? null : (`${id}.role` as const);
}

/**
 * The Bellavere team. No stock portraits — serif initials in a gold-on-navy
 * circle until real photographs exist. Personal emails in the data are
 * deliberately not rendered here (see data/company.ts). Names and initials
 * come from the data; roles and bios from messages `common.company.team`
 * (a bio may quote the person's phone as `{phone}`).
 */
export function TeamGrid() {
  const t = useTranslations("common.company.team");
  return (
    <RevealStagger className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 lg:grid-cols-3">
      {company.team.map((member) => {
        const role = roleKey(member.id);
        const contact = company.contacts.find(
          (person) => person.id === member.id,
        );
        return (
          <RevealItem key={member.id} className="text-center">
            <span
              className="mx-auto flex size-20 items-center justify-center rounded-full bg-navy-900 font-serif text-2xl text-gold-500"
              aria-hidden
            >
              {member.initials}
            </span>
            <h3 className="mt-5 text-xl">{member.name}</h3>
            {role ? <p className="eyebrow mt-2">{t(role)}</p> : null}
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
              {t(`${member.id}.bio`, contact ? { phone: contact.phone } : {})}
            </p>
          </RevealItem>
        );
      })}
    </RevealStagger>
  );
}
