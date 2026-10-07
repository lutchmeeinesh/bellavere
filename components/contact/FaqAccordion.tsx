"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { company } from "@/data/company";

/**
 * The questions in display order: `id` builds the trigger and panel ids,
 * `key` finds the wording in messages (`contact.faq.items.<key>`).
 */
const FAQ_ITEMS = [
  { id: "fees", key: "fees" },
  { id: "reply", key: "reply" },
  { id: "payouts", key: "payouts" },
  { id: "own-use", key: "ownUse" },
  { id: "onboarding", key: "onboarding" },
] as const;

type FaqKey = (typeof FAQ_ITEMS)[number]["key"];

/**
 * Accessible one-open-at-a-time FAQ accordion with animated panels. The
 * floating WhatsApp button steps aside while the list is behind it
 * (data-whatsapp-avoid), so it never hides the end of a question and its
 * open/close chevron.
 */
export function FaqAccordion({ className }: { className?: string }) {
  const t = useTranslations("contact.faq");
  const tc = useTranslations("common");
  const format = useFormatter();
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  // The fee answer is the company's pricing wording; the reply answer names
  // the contacts on this page ("Ankit and Nihal").
  const answers: Record<FaqKey, string> = {
    fees: tc("company.pricing.detail", {
      maxFee: company.pricing.maxFeeRate,
    }),
    reply: t("items.reply.answer", {
      names: format.list(
        company.contacts.map((person) => person.name.split(" ")[0]),
      ),
    }),
    payouts: t("items.payouts.answer"),
    ownUse: t("items.ownUse.answer"),
    onboarding: t("items.onboarding.answer"),
  };

  return (
    <div
      data-whatsapp-avoid
      className={cn("border-t border-sand-300", className)}
    >
      {FAQ_ITEMS.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="border-b border-sand-300">
            <h3 className="text-base">
              <button
                type="button"
                id={`faq-trigger-${item.id}`}
                aria-expanded={open}
                aria-controls={`faq-panel-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-6 py-5 text-left",
                  "cursor-pointer transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
                )}
              >
                <span
                  className={cn(
                    "font-serif text-xl font-semibold transition-colors duration-150",
                    open ? "text-gold-700" : "text-navy-900",
                  )}
                >
                  {t(`items.${item.key}.question`)}
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-5 shrink-0 text-gold-700 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="panel"
                  id={`faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-ink-500">
                    {answers[item.key]}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
