"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { company } from "@/data/company";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "fees",
    question: "What does Bellavere charge?",
    answer: company.pricing.detail,
  },
  {
    id: "reply",
    question: "How quickly will you get back to me?",
    answer: `The same day — every query, every time. ${company.contacts
      .map((person) => person.name.split(" ")[0])
      .join(
        " and ",
      )} can be reached every day, 24/7, on the numbers on this page.`,
  },
  {
    id: "payouts",
    question: "When do I get paid?",
    answer:
      "Every month you receive a full statement — gross income, our fee and any expenses, line by line. Payout timing is set out in your management agreement.",
  },
  {
    id: "own-use",
    question: "Can I still use my property?",
    answer:
      "Of course — it’s your home. Talk to your client-relations contact about the dates you need; how owner stays work is set out in your management agreement.",
  },
  {
    id: "onboarding",
    question: "How fast is onboarding?",
    answer:
      "One to two weeks from our first meeting. In that time we inspect the property, agree your fee and set up your listing.",
  },
];

/** Accessible one-open-at-a-time FAQ accordion with animated panels. */
export function FaqAccordion({ className }: { className?: string }) {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  return (
    <div className={cn("border-t border-sand-300", className)}>
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
                  {item.question}
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
                  <p className="max-w-2xl pb-6 text-ink-500">{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
