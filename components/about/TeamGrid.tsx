import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { company } from "@/data/company";

/**
 * The Bellavere team. No stock portraits — serif initials in a gold-on-navy
 * circle until real photographs exist. Personal emails in the data are
 * deliberately not rendered here (see data/company.ts).
 */
export function TeamGrid() {
  return (
    <RevealStagger className="mx-auto grid max-w-3xl gap-12 sm:grid-cols-2">
      {company.team.map((member) => (
        <RevealItem key={member.name} className="text-center">
          <span
            className="mx-auto flex size-20 items-center justify-center rounded-full bg-navy-900 font-serif text-2xl text-gold-500"
            aria-hidden
          >
            {member.initials}
          </span>
          <h3 className="mt-5 text-xl">{member.name}</h3>
          <p className="eyebrow mt-2">{member.role}</p>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
            {member.bio}
          </p>
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
