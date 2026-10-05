"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BedDouble } from "lucide-react";
import { useTranslations } from "next-intl";
import { BedroomStepper } from "@/components/estimator/BedroomStepper";
import { ChoiceCards } from "@/components/estimator/ChoiceCards";
import { EstimateResult } from "@/components/estimator/EstimateResult";
import { FeatureChips } from "@/components/estimator/FeatureChips";
import { AVAILABILITY_ICONS, TYPE_ICONS } from "@/components/estimator/icons";
import { IslandMap } from "@/components/estimator/IslandMap";
import { useEstimatorText } from "@/components/estimator/useEstimatorText";
import { WeeksSlider } from "@/components/estimator/WeeksSlider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWhatsAppOverride } from "@/components/whatsapp/WhatsAppProvider";
import {
  ESTIMATOR_CONFIG,
  PROPERTY_TYPES,
  REGIONS,
  type Feature,
  type PropertyType,
  type Region,
} from "@/data/estimator-config";
import { parseEstimatorParams, type EstimatorAnswers } from "@/lib/estimator";

/** The questions, in order; their wording is `estimator.steps.<id>`. */
const STEPS = ["type", "region", "bedrooms", "features", "availability"] as const;
/** Index of the result screen, after the last question. */
const RESULT = STEPS.length;

const AVAILABILITY = ["yearRound", "partYear"] as const;
type Availability = (typeof AVAILABILITY)[number];

/** The answers while the visitor works through the questions. */
interface Draft {
  type?: PropertyType;
  region?: Region;
  bedrooms: number;
  features: Feature[];
  availability?: Availability;
  /** The part-year slider; kept when switching to year-round and back. */
  partYearWeeks: number;
}

const INITIAL_DRAFT: Draft = {
  bedrooms: ESTIMATOR_CONFIG.bedrooms.default,
  features: [],
  partYearWeeks: ESTIMATOR_CONFIG.weeks.default,
};

/** Complete answers for the estimate, or null while some are missing. */
function toAnswers(draft: Draft): EstimatorAnswers | null {
  if (!draft.type || !draft.region || !draft.availability) return null;
  return {
    type: draft.type,
    region: draft.region,
    bedrooms: draft.bedrooms,
    features: draft.features,
    weeks:
      draft.availability === "yearRound"
        ? ESTIMATOR_CONFIG.weeks.yearRound
        : draft.partYearWeeks,
  };
}

/** Answers from a deep link (/estimate?region=north&bedrooms=3…). */
function draftFromUrl(search: string): Partial<Draft> {
  const { weeks, ...answers } = parseEstimatorParams(search);
  const draft: Partial<Draft> = {};
  if (answers.type) draft.type = answers.type;
  if (answers.region) draft.region = answers.region;
  if (answers.bedrooms !== undefined) draft.bedrooms = answers.bedrooms;
  if (answers.features) draft.features = [...answers.features];
  if (weeks !== undefined) {
    if (weeks >= ESTIMATOR_CONFIG.weeks.yearRound) {
      draft.availability = "yearRound";
    } else {
      draft.availability = "partYear";
      draft.partYearWeeks = weeks;
    }
  }
  return draft;
}

const EASE = [0.22, 1, 0.36, 1] as const;
/** Pause between choosing a card and the next question, so the tick shows. */
const ADVANCE_DELAY_MS = 180;
/** Space the fixed header (72px) takes at the top of the window. */
const HEADER_OFFSET = 96;

/**
 * The rental income estimator: five questions, one per screen, then the
 * result. The first question is rendered on the server (the page is
 * static); deep links pre-fill answers after hydration. Back keeps every
 * answer; each new screen moves keyboard focus to its heading.
 */
export function EstimatorFlow() {
  const t = useTranslations("estimator");
  const text = useEstimatorText();
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  // False until the visitor first moves: the page load never steals focus.
  const [moved, setMoved] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<number | undefined>(undefined);

  // Deep links, read once in the browser (useSearchParams would make the
  // whole page render on the client).
  useEffect(() => {
    const fromUrl = draftFromUrl(window.location.search);
    if (Object.keys(fromUrl).length > 0) {
      setDraft((current) => ({ ...current, ...fromUrl }));
    }
  }, []);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const answers = useMemo(() => toAnswers(draft), [draft]);
  const showResult = step === RESULT && answers !== null;
  const stepId = STEPS[Math.min(step, STEPS.length - 1)];

  // The floating WhatsApp button stays out of the way of the questions; the
  // result brings it back with its own message.
  useWhatsAppOverride(showResult ? null : { hidden: true });

  // Keep the top of the card in view when the screen changes (e.g. after
  // answering a question lower down on a phone).
  useEffect(() => {
    if (!moved) return;
    const top = cardRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < HEADER_OFFSET) {
      window.scrollTo({
        top: window.scrollY + top - HEADER_OFFSET,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [step, moved, reduceMotion]);

  function update(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function goTo(next: number) {
    window.clearTimeout(advanceTimer.current);
    setDirection(next >= step ? 1 : -1);
    setStep(next);
    setMoved(true);
  }

  /** After a card is chosen: on to the next question, once the tick shows. */
  function advanceSoon() {
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(
      () => goTo(step + 1),
      ADVANCE_DELAY_MS,
    );
  }

  const canContinue =
    (stepId === "type" && draft.type !== undefined) ||
    (stepId === "region" && draft.region !== undefined) ||
    stepId === "bedrooms" ||
    stepId === "features" ||
    (stepId === "availability" && draft.availability !== undefined);

  const titleId = `${baseId}-title`;
  const hintId = `${baseId}-hint`;
  const stepLabelId = `${baseId}-step`;
  const percent = Math.round(((showResult ? RESULT + 1 : step + 1) / (RESULT + 1)) * 100);
  const stepLabel = t("flow.step", { current: step + 1, total: STEPS.length });

  return (
    <Card className="mx-auto max-w-3xl p-6 sm:p-10">
      <div ref={cardRef}>
        {/* Progress. The step label also describes each question's heading. */}
        {showResult ? null : (
          <p id={stepLabelId} className="eyebrow mb-3" aria-hidden>
            {stepLabel}
          </p>
        )}
        <div
          role="progressbar"
          aria-label={t("flow.progress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={showResult ? t("result.eyebrow") : stepLabel}
          className="h-1 overflow-hidden rounded-full bg-sand-100"
        >
          <motion.div
            className="h-full origin-left rounded-full bg-gold-500"
            initial={false}
            animate={{ scaleX: percent / 100 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
          />
        </div>

        {/* The current screen */}
        <div className="mt-8 sm:min-h-[20rem]">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={showResult ? "result" : stepId}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * 32 }),
                center: { opacity: 1, x: 0 },
                exit: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * -32 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
            >
              <FocusOnMount active={moved}>
                {showResult && answers ? (
                  <EstimateResult
                    answers={answers}
                    headingId={`${baseId}-result`}
                    onChangeAnswers={() => goTo(0)}
                  />
                ) : (
                  <>
                    <h2
                      id={titleId}
                      tabIndex={-1}
                      aria-describedby={stepLabelId}
                      className="text-3xl outline-none sm:text-4xl"
                    >
                      {t(`steps.${stepId}.title`)}
                    </h2>
                    <p id={hintId} className="mt-3 text-ink-500">
                      {t(`steps.${stepId}.hint`)}
                    </p>

                    {stepId === "type" ? (
                      <ChoiceCards
                        options={PROPERTY_TYPES.map((id) => ({
                          id,
                          title: t(`types.${id}.name`),
                          description: t(`types.${id}.description`),
                          icon: TYPE_ICONS[id],
                        }))}
                        value={draft.type}
                        onChange={(type) => update({ type })}
                        onActivate={advanceSoon}
                        labelledBy={titleId}
                        describedBy={hintId}
                        className="mt-7 grid gap-4 sm:grid-cols-3"
                      />
                    ) : null}

                    {stepId === "region" ? (
                      <div className="mt-7 grid items-center gap-8 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                        <IslandMap
                          selected={draft.region}
                          highlighted={hoveredRegion}
                          className="mx-auto hidden max-w-56 sm:block"
                        />
                        <ChoiceCards
                          variant="rows"
                          options={REGIONS.map((id) => ({
                            id,
                            title: t(`regions.${id}.name`),
                            description: t(`regions.${id}.towns`),
                          }))}
                          value={draft.region}
                          onChange={(region) => update({ region })}
                          onActivate={advanceSoon}
                          onHighlight={setHoveredRegion}
                          labelledBy={titleId}
                          describedBy={hintId}
                          className="grid gap-2.5"
                        />
                      </div>
                    ) : null}

                    {stepId === "bedrooms" ? (
                      <div className="mt-7 flex flex-col items-center rounded-2xl bg-sand-100 px-6 py-8 sm:py-10">
                        <span className="flex size-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                          <BedDouble className="size-5" aria-hidden />
                        </span>
                        <BedroomStepper
                          value={draft.bedrooms}
                          onChange={(bedrooms) => update({ bedrooms })}
                          labelledBy={titleId}
                          className="mt-5"
                        />
                        <p className="mt-3 text-sm text-ink-500" aria-hidden>
                          {text.bedrooms(draft.bedrooms)}
                        </p>
                      </div>
                    ) : null}

                    {stepId === "features" ? (
                      <div className="mt-7">
                        <FeatureChips
                          value={draft.features}
                          onChange={(features) => update({ features })}
                          labelledBy={titleId}
                          describedBy={hintId}
                        />
                      </div>
                    ) : null}

                    {stepId === "availability" ? (
                      <>
                        <ChoiceCards
                          options={AVAILABILITY.map((id) => ({
                            id,
                            title: t(`availability.${id}.title`),
                            description: t(`availability.${id}.description`, {
                              weeks: ESTIMATOR_CONFIG.weeks.yearRound,
                            }),
                            icon: AVAILABILITY_ICONS[id],
                          }))}
                          value={draft.availability}
                          onChange={(availability) => update({ availability })}
                          labelledBy={titleId}
                          describedBy={hintId}
                          className="mt-7 grid gap-4 sm:grid-cols-2"
                        />
                        <AnimatePresence initial={false}>
                          {draft.availability === "partYear" ? (
                            <motion.div
                              key="weeks"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <div className="pt-5">
                                <WeeksSlider
                                  value={draft.partYearWeeks}
                                  onChange={(partYearWeeks) => update({ partYearWeeks })}
                                />
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : null}
                  </>
                )}
              </FocusOnMount>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Back / continue */}
        {showResult ? null : (
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-sand-300 pt-6">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => goTo(step - 1)} className="-ml-3">
                <ArrowLeft className="size-4" aria-hidden />
                {t("flow.back")}
              </Button>
            ) : (
              <span />
            )}
            <Button
              onClick={() => goTo(step + 1)}
              disabled={!canContinue}
              className="disabled:pointer-events-none disabled:opacity-40"
            >
              {step === STEPS.length - 1 ? t("flow.seeEstimate") : t("flow.continue")}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Moves keyboard focus to the screen's heading when it appears, once the
 * visitor has started (so screen readers announce the new question).
 */
function FocusOnMount({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    ref.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    // Only when the screen first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={ref}>{children}</div>;
}
