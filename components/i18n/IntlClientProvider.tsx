"use client";

import type { ComponentProps } from "react";
import { NextIntlClientProvider } from "next-intl";

/**
 * next-intl's provider for client components, imported from a client module
 * so the root documents pass every value explicitly (locale, messages,
 * time zone). Rendering next-intl's server variant instead would look the
 * locale up in the request config, which the static portal pages (e.g.
 * /login) must never do.
 */
export function IntlClientProvider(
  props: ComponentProps<typeof NextIntlClientProvider>,
) {
  return <NextIntlClientProvider {...props} />;
}
