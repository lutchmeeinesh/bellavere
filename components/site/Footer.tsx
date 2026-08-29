import Link from "next/link";
import {
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
} from "@/components/site/SocialIcons";
import { Logo } from "@/components/site/Logo";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";

const columns = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/properties", label: "Our portfolio" },
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
  return (
    <footer className="bg-navy-900 text-white">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo dark />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              {company.tagline} Villa and apartment management across the north
              and west coasts of Mauritius since {company.founded}.
            </p>
            <div className="mt-6 flex gap-3">
              {/* TODO: confirm with client — social links */}
              <a
                href={company.social.instagram}
                aria-label="BellaVere on Instagram"
                className="rounded-full border border-white/15 p-2.5 text-white/70 transition-colors duration-200 hover:border-gold-500 hover:text-gold-500"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={company.social.facebook}
                aria-label="BellaVere on Facebook"
                className="rounded-full border border-white/15 p-2.5 text-white/70 transition-colors duration-200 hover:border-gold-500 hover:text-gold-500"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href={company.social.linkedin}
                aria-label="BellaVere on LinkedIn"
                className="rounded-full border border-white/15 p-2.5 text-white/70 transition-colors duration-200 hover:border-gold-500 hover:text-gold-500"
              >
                <LinkedInIcon className="size-4" />
              </a>
            </div>
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

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              A quiet monthly note on coastal property
            </p>
            {/* Decorative newsletter capture — wire to an email provider later.
                TODO: confirm with client */}
            <form className="mt-3 flex max-w-sm gap-2" aria-label="Newsletter signup">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-gold-500 focus:outline-none"
              />
              <button
                type="button"
                className="shrink-0 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-medium text-navy-900 transition-colors duration-200 hover:bg-gold-600 hover:text-white"
              >
                Subscribe
              </button>
            </form>
          </div>
          <div className="text-xs leading-relaxed text-white/40 lg:text-right">
            <p>
              © {new Date().getFullYear()} {company.name}. All rights reserved.
            </p>
            <p className="mt-1">
              {company.address.line1}, {company.address.line2},{" "}
              {company.address.country}
            </p>
            <p className="mt-1">Demo website — all listings and figures are illustrative.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
