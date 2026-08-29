import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { company } from "@/data/company";

/**
 * The three-person leadership team. No stock portraits — serif initials in
 * a gold-on-navy circle keep the demo honest until real photography exists.
 */
export function TeamGrid() {
  return (
    <RevealStagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
