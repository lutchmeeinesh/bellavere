import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { company } from "@/data/company";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** "100%" in English, "100 %" in French (narrow no-break space, as formatPercent). */
function unitSuffix(suffix: string, locale: AppLocale) {
  return locale === "fr" && suffix === "%" ? " %" : suffix;
}

/**
 * Four commitments under the hero, counting up on reveal. These are promises
 * that are true by definition of the service (see data/company.ts). Swap in
 * track-record figures — properties managed, occupancy, ratings — only once
 * they are real. Wording: messages `common.company.commitments.<id>`.
 */
export function TrustBar() {
  const t = useTranslations("common.company.commitments");
  const locale = useLocale();
  return (
    <section className="border-b border-sand-300 py-24 lg:py-32">
      <Container>
        <RevealStagger className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {company.commitments.map((item) => (
            <RevealItem key={item.id} className="text-center">
              {/* French: "Le jour même" takes two lines at most widths, and
                  the type's tight leading let the "j" touch the accent of
                  "même"; a little more leading there (English unchanged). */}
              <div
                className={cn(
                  "font-serif text-5xl text-navy-900 lg:text-6xl",
                  locale === "fr" && "leading-[1.1]",
                )}
              >
                {"display" in item ? (
                  t(`${item.id}.display`)
                ) : (
                  <CountUp
                    value={item.value}
                    suffix={
                      "suffix" in item ? unitSuffix(item.suffix, locale) : ""
                    }
                    locale={locale}
                  />
                )}
              </div>
              <p className="eyebrow mt-3">{t(`${item.id}.label`)}</p>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  );
}
