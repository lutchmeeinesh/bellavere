import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SocialLink, publishedSocialLinks } from "@/components/site/SocialIcons";
import { Logo } from "@/components/site/Logo";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";

// Link text: messages `common.footer.links.*` and `common.serviceNames.*`.
const columns = [
  {
    id: "company",
    links: [
      { href: "/about", label: "footer.links.about" },
      { href: "/contact", label: "footer.links.contact" },
    ],
  },
  {
    id: "services",
    links: [
      { href: "/services#rental", label: "serviceNames.rental" },
      { href: "/services#maintenance", label: "serviceNames.maintenance" },
      { href: "/services#client-care", label: "serviceNames.clientCare" },
      { href: "/services#concierge", label: "serviceNames.concierge" },
      { href: "/services#syndic", label: "serviceNames.syndic" },
    ],
  },
  {
    id: "owners",
    links: [
      { href: "/login", label: "footer.links.ownerLogin" },
      { href: "/contact", label: "footer.links.listProperty" },
      { href: "/contact#faq", label: "footer.links.ownerFaq" },
    ],
  },
] as const;

export function Footer() {
  const t = useTranslations("common");
  // Only the social profiles set in data/company.ts are shown.
  const socialLinks = publishedSocialLinks(company.social);
  return (
    <footer className="bg-navy-900 text-white">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo dark />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              {t("footer.blurb", { tagline: t("company.tagline") })}
            </p>
            {company.contacts.length > 0 ? (
              <div className="mt-5 text-sm text-white/70">
                {company.hours ? (
                  <p className="text-white/60">
                    {t("footer.callUs", { hours: t("company.hoursInline") })}
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
                {socialLinks.map(({ network, href, Icon }) => (
                  <SocialLink
                    key={network}
                    href={href}
                    label={t(`social.${network}`, { company: company.name })}
                    className="rounded-full border border-white/15 p-2.5 text-white/70 transition-colors duration-200 hover:border-gold-500 hover:text-gold-500"
                  >
                    <Icon className="size-4" />
                  </SocialLink>
                ))}
              </div>
            ) : null}
          </div>

          {columns.map((column) => (
            <nav key={column.id} aria-label={t(`footer.columns.${column.id}`)}>
              <h3 className="font-sans text-xs font-semibold tracking-(--tracking-label) text-gold-500 uppercase">
                {t(`footer.columns.${column.id}`)}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {t(link.label)}
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
              {t("footer.copyright", {
                year: String(new Date().getFullYear()),
                legalName: company.legalName,
              })}
            </p>
            <p className="mt-1">
              {t("footer.registration", {
                number: company.companyNumber,
                country: t("company.country"),
              })}
            </p>
          </div>
          <div className="lg:text-right">
            <p className="flex gap-4 lg:justify-end">
              <Link
                href="/privacy"
                className="transition-colors duration-200 hover:text-white"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href="/terms"
                className="transition-colors duration-200 hover:text-white"
              >
                {t("footer.terms")}
              </Link>
            </p>
            <p className="mt-1">{t("footer.demoNote")}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
