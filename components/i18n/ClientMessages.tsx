import type { ReactNode } from "react";
import { MergeIntlMessages } from "@/components/i18n/MergeIntlMessages";
import { pickMessages, type MessagePath } from "@/i18n/messages";
import type { AppLocale } from "@/i18n/routing";

/**
 * Sends the browser the messages a page's own client components read, on
 * top of the ones every public page gets (SITE_CLIENT_MESSAGES in the root
 * document), and only with that page:
 *
 *   <ClientMessages locale={locale} paths={PAGE_CLIENT_MESSAGES.contact}>
 *     …the page, client components included…
 *   </ClientMessages>
 *
 * Server components inside read every message anyway; this only matters
 * for client components (useTranslations in a "use client" file).
 */
export function ClientMessages({
  locale,
  paths,
  children,
}: {
  locale: AppLocale;
  paths: readonly MessagePath[];
  children: ReactNode;
}) {
  return (
    <MergeIntlMessages messages={pickMessages(locale, paths)}>
      {children}
    </MergeIntlMessages>
  );
}
