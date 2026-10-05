"use client";

import { MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useWhatsAppState } from "@/components/whatsapp/WhatsAppProvider";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_PRIMARY } from "@/data/site";
import { track } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/whatsapp";

/**
 * Floating WhatsApp button (minimal version; phase 1 stream B redesigns
 * it). Opens a chat with the primary number, pre-filled with the current
 * page's message or the default one for the page's language, and hides
 * while a mounted component asks it to (useWhatsAppOverride).
 */
export function WhatsAppButton() {
  const { hidden, message } = useWhatsAppState();
  const locale = useLocale();
  const t = useTranslations("whatsapp.button");
  if (hidden) return null;

  return (
    <a
      href={whatsappUrl(WHATSAPP_PRIMARY, message ?? WHATSAPP_DEFAULT_MESSAGE[locale])}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      title={t("label")}
      onClick={() => track("WhatsApp Clicked", { placement: "floating" })}
      className="fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full bg-gold-500 text-navy-900 shadow-(--shadow-lift) transition-colors duration-200 hover:bg-gold-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
