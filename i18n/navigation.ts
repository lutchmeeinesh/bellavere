import { createElement, type ComponentProps } from "react";
import NextLink from "next/link";
import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

/**
 * Locale-aware navigation for the public site. Use these instead of
 * next/link and next/navigation in every public component:
 *
 *   import { Link, usePathname, useRouter } from "@/i18n/navigation";
 *   <Link href="/contact">…</Link>   // "/contact" in English, "/fr/contact" in French
 *
 * Hrefs are written without a locale ("/services#syndic"); the current
 * locale is added when needed. `usePathname()` returns the path without the
 * locale ("/services" on both /services and /fr/services).
 */
const {
  Link: IntlLink,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);

export { redirect, usePathname, useRouter, getPathname };

/**
 * The owner portal is English-only at fixed URLs (/login, /dashboard,
 * /admin): links to it are never given a locale prefix.
 */
export const PORTAL_PATH = /^\/(login|dashboard|admin)(?=[/?#]|$)/;

type LinkProps = ComponentProps<typeof IntlLink>;

function hrefPathname(href: LinkProps["href"]): string {
  return typeof href === "string" ? href : (href.pathname ?? "");
}

/**
 * next-intl's Link, except for portal paths, which stay unprefixed (a plain
 * next/link). Works in server and client components.
 *
 * Portal links are not prefetched unless the caller asks (`prefetch`): the
 * "Owner login" buttons are in view on most public pages, and prefetching
 * /login loaded the portal's root layout, sign-in page and error page code
 * (about 30 kB) on every visit, for the few visitors who are owners. The
 * sign-in page then loads on click (it is static). Inside the portal the
 * shell's own links (next/link) prefetch as before.
 */
export function Link(props: LinkProps) {
  if (PORTAL_PATH.test(hrefPathname(props.href))) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { locale, ...rest } = props;
    return createElement(NextLink, {
      prefetch: false,
      ...rest,
    } as ComponentProps<typeof NextLink>);
  }
  return createElement(IntlLink, props);
}
