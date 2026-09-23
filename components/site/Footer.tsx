import Link from "next/link";
import { SocialLink, publishedSocialLinks } from "@/components/site/SocialIcons";
import { Logo } from "@/components/site/Logo";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";

const columns = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/services#rental", label: "Rental management" },
      { href: "/services#maintenance", label: "Maintenance" },
      { href: "/services#client-care", label: "Client care" },
      { href: "/services#concierge", label: "Concierge & services" },
      { href: "/services#syndic", label: "Syndic & residences" },
    ],
  },
  {
    title: "Owners",
    links: [
      { href: "/login", label: "Owner login" },
      { href: "/contact", label: "List your property" },
      { href: "/contact#faq", label: "Owner FAQ" },
    ],
  },
];

export function Footer() {
  // Only the social profiles set in data/company.ts are shown.
  const socialLinks = publishedSocialLinks(company.name, company.social);
  return (
    <footer className="bg-navy-900 text-white">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo dark />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              {company.tagline} Property management and syndic services all
              around Mauritius — north, south, east, west and the central
              plateau.
            </p>
            {company.contacts.length > 0 ? (
              <div className="mt-5 text-sm text-white/70">
                {company.hours ? (
                  <p className="text-white/60">
                    Call us — {company.hours.toLowerCase()}
                  </p>
                ) : null}
                <ul className="mt-1.5 space-y-1">
                  {company.contacts.map((person) => (
                    <li key={person.name}>
                      {person.name.split(" ")[0]}{" "}
                      <a
                        href={`tel:${person.phone.replace(/\s/g, "")}`}
                        className="transition-colors duration-200 hover:text-white"
                      >
                        {person.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {socialLinks.length > 0 ? (
              <div className="mt-6 flex gap-3">
                {socialLinks.map(({ label, href, Icon }) => (
                  <SocialLink
                    key={label}
                    href={href}
                    label={label}
                    className="rounded-full border border-white/15 p-2.5 text-white/70 transition-colors duration-200 hover:border-gold-500 hover:text-gold-500"
                  >
                    <Icon className="size-4" />
                  </SocialLink>
                ))}
              </div>
            ) : null}
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="font-sans text-xs font-semibold tracking-(--tracking-label) text-gold-500 uppercase">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs leading-relaxed text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p>
              © {new Date().getFullYear()} {company.legalName}. All rights
              reserved.
            </p>
            <p className="mt-1">
              Company No. {company.companyNumber} · {company.address.country}
            </p>
          </div>
          <div className="lg:text-right">
            <p className="flex gap-4 lg:justify-end">
              <Link
                href="/privacy"
                className="transition-colors duration-200 hover:text-white"
              >
                Privacy policy
              </Link>
              <Link
                href="/terms"
                className="transition-colors duration-200 hover:text-white"
              >
                Terms of use
              </Link>
            </p>
            <p className="mt-1">
              The owner-portal demo uses sample accounts and figures.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
