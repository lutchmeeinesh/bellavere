import type { routing } from "@/i18n/routing";
import type { Messages } from "@/i18n/messages";

/**
 * Typed next-intl: locales are "en" | "fr", and message keys are checked
 * against the English messages (messages/en.json), so `t("nav.hom")` is a
 * TypeScript error.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: Messages;
  }
}
