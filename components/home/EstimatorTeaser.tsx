"use client";

import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BedroomStepper } from "@/components/estimator/BedroomStepper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Field, Select } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ESTIMATOR_CONFIG, REGIONS, type Region } from "@/data/estimator-config";
import { getPathname, useRouter } from "@/i18n/navigation";
import { estimatorSearchParams, isRegion } from "@/lib/estimator";

/**
 * Home-page invitation to the rental income estimator: a one-line pitch
 * and a quick start (region + bedrooms) that opens /estimate with those
 * answers filled in (/estimate?region=north&bedrooms=3). A plain GET form
 * underneath, so it works before (and without) JavaScript too.
 * Wording: messages `estimator.teaser.*`.
 */
export function EstimatorTeaser() {
  const t = useTranslations("estimator");
  const locale = useLocale();
  const router = useRouter();
  const id = useId();
  const [region, setRegion] = useState<Region | "">("");
  const [bedrooms, setBedrooms] = useState<number>(ESTIMATOR_CONFIG.bedrooms.default);
  const regionId = `${id}-region`;
  const bedroomsId = `${id}-bedrooms`;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = estimatorSearchParams({ region: region || undefined, bedrooms });
    router.push(`/estimate?${query}`);
  }

  return (
    <section className="bg-sand-100 py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
          <SectionHeading
            eyebrow={t("teaser.eyebrow")}
            title={t("teaser.title")}
            sub={t("teaser.pitch")}
          />

          <Reveal delay={0.1}>
            <Card className="p-6 sm:p-8">
              <form
                action={getPathname({ href: "/estimate", locale })}
                method="get"
                onSubmit={onSubmit}
                aria-label={t("teaser.formLabel")}
                className="space-y-5"
              >
                <Field label={t("teaser.region")} htmlFor={regionId}>
                  <Select
                    id={regionId}
                    name="region"
                    value={region}
                    onChange={(event) =>
                      setRegion(isRegion(event.target.value) ? event.target.value : "")
                    }
                  >
                    <option value="">{t("teaser.anyRegion")}</option>
                    {REGIONS.map((code) => (
                      <option key={code} value={code}>
                        {t("teaser.regionOption", {
                          name: t(`regions.${code}.name`),
                          towns: t(`regions.${code}.towns`),
                        })}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
                  <div className="space-y-1.5">
                    <p id={bedroomsId} className="text-sm font-medium text-navy-900">
                      {t("teaser.bedrooms")}
                    </p>
                    <BedroomStepper
                      size="sm"
                      value={bedrooms}
                      onChange={setBedrooms}
                      labelledBy={bedroomsId}
                      className="sm:w-40"
                    />
                  </div>
                  <Button type="submit" className="h-[46px] w-full">
                    {t("teaser.action")}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </div>

                {/* The stepper's value, for the no-JavaScript submission. */}
                <input type="hidden" name="bedrooms" value={bedrooms} />
                <p className="text-xs text-ink-500">{t("teaser.note")}</p>
              </form>
            </Card>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
