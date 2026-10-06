"use client";

import { useMemo, type ReactNode } from "react";
import {
  NextIntlClientProvider,
  useLocale,
  useMessages,
  type AbstractIntlMessages,
} from "next-intl";

type Tree = AbstractIntlMessages;

/** A group of messages, as opposed to one message (precompiled messages can be arrays). */
const isGroup = (node: Tree[string] | undefined): node is Tree =>
  typeof node === "object" && !Array.isArray(node);

/** `extra` laid over `base`, merging nested groups (neither is changed). */
function mergeMessages(base: Tree, extra: Tree): Tree {
  const merged: Tree = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    const current = merged[key];
    merged[key] =
      isGroup(value) && isGroup(current) ? mergeMessages(current, value) : value;
  }
  return merged;
}

/**
 * A nested NextIntlClientProvider whose messages are the surrounding ones
 * plus `messages` (a nested provider would otherwise replace them). Locale,
 * time zone and formatters carry over from the provider above. Rendered by
 * components/i18n/ClientMessages.tsx.
 */
export function MergeIntlMessages({
  messages,
  children,
}: {
  messages: AbstractIntlMessages;
  children: ReactNode;
}) {
  const locale = useLocale();
  const base = useMessages() as Tree;
  const merged = useMemo(() => mergeMessages(base, messages), [base, messages]);
  return (
    <NextIntlClientProvider locale={locale} messages={merged}>
      {children}
    </NextIntlClientProvider>
  );
}
