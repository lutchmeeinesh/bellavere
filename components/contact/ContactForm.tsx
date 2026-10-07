"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ContactErrorCode } from "@/app/api/contact/route";
import { company } from "@/data/company";
import { PUBLIC_EMAIL } from "@/data/site";
import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics";
import { CONTACT_LIMITS, EMAIL_PATTERN } from "@/lib/contactLimits";
import { useEstimatePrefill } from "@/components/estimator/useEstimatePrefill";
import { Button } from "@/components/ui/Button";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/Input";

/** Wording: messages `contact.form.*`. */
type FormTranslator = ReturnType<typeof useTranslations<"contact.form">>;

type FormValues = {
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  propertyCount: string;
  message: string;
  consent: boolean;
  /** Honeypot — hidden from humans, left empty by real visitors. */
  hp_extra: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

/** Fields that can be invalid, in the order they appear on the form. */
const FIELD_IDS: [keyof FormValues, string][] = [
  ["name", "contact-name"],
  ["email", "contact-email"],
  ["phone", "contact-phone"],
  ["message", "contact-message"],
  ["consent", "contact-consent"],
];

const EMPTY_VALUES: FormValues = {
  name: "",
  email: "",
  phone: "",
  propertyType: "",
  propertyCount: "",
  message: "",
  consent: false,
  hp_extra: "",
};

/** Dialling-code hint in the phone field (a fact, the same in every language). */
const PHONE_PLACEHOLDER = "+230 …";

function validate(values: FormValues, t: FormTranslator): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = t("validation.nameMissing");
  } else if (values.name.trim().length > CONTACT_LIMITS.name) {
    errors.name = t("validation.nameTooLong", { max: CONTACT_LIMITS.name });
  }
  if (!values.email.trim()) {
    errors.email = t("validation.emailMissing");
  } else if (
    values.email.trim().length > CONTACT_LIMITS.email ||
    !EMAIL_PATTERN.test(values.email.trim())
  ) {
    errors.email = t("validation.emailInvalid");
  }
  if (values.phone.trim().length > CONTACT_LIMITS.phone) {
    errors.phone = t("validation.phoneTooLong", { max: CONTACT_LIMITS.phone });
  }
  const messageLength = values.message.trim().length;
  if (!messageLength) {
    errors.message = t("validation.messageMissing");
  } else if (messageLength > CONTACT_LIMITS.message) {
    errors.message = t("validation.messageTooLong", {
      max: CONTACT_LIMITS.message,
      length: messageLength,
    });
  }
  if (!values.consent) {
    errors.consent = t("validation.consentMissing");
  }
  return errors;
}

/** Contact enquiry form: client-side validation, POST to /api/contact, animated success state. */
export function ContactForm() {
  const t = useTranslations("contact.form");
  const format = useFormatter();
  const locale = useLocale();
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Arriving from the income estimator (/contact?source=estimate&…): pre-fill
  // the property and a summary of the estimate. The summary follows a
  // currency switch until the visitor edits it.
  const estimatePrefill = useEstimatePrefill();
  const prefillApplied = useRef(false);
  const prefilledMessage = useRef<string | null>(null);
  useEffect(() => {
    if (!estimatePrefill) return;
    const first = !prefillApplied.current;
    const previous = prefilledMessage.current;
    const { message } = estimatePrefill;
    prefillApplied.current = true;
    prefilledMessage.current = message;
    setValues((prev) => {
      const untouched =
        (first && prev.message === "") ||
        (previous !== null && prev.message === previous);
      return {
        ...prev,
        ...(first
          ? {
              propertyType: prev.propertyType || estimatePrefill.propertyType,
              propertyCount:
                prev.propertyCount || estimatePrefill.propertyCount,
            }
          : {}),
        message: message !== null && untouched ? message : prev.message,
      };
    });
  }, [estimatePrefill]);

  /**
   * The visitor's message for an API error code (app/api/contact/route.ts),
   * in the page's language. Delivery problems always list the direct
   * contacts, so no enquiry is silently lost. Any other answer (an unknown
   * code, method_not_allowed, a platform error page) reads as a failed send,
   * never as the server's English text.
   */
  function submitErrorText(code?: string): string {
    const directContact = t("errors.directContact", {
      email: PUBLIC_EMAIL,
      people: format.list(
        company.contacts.map((person) =>
          t("errors.person", {
            name: person.name.split(" ")[0],
            phone: person.phone,
          }),
        ),
        { type: "disjunction" },
      ),
    });
    switch (code as ContactErrorCode | undefined) {
      case "too_long":
        return t("errors.tooLong", {
          max: CONTACT_LIMITS.message,
          directContact,
        });
      case "missing_fields":
        return t("errors.missingFields");
      case "rate_limited":
        return t("errors.rateLimited");
      case "invalid_request":
        return t("errors.invalidRequest");
      case "unsupported":
        return t("errors.unsupported");
      case "forbidden":
        return t("errors.forbidden");
      default:
        return t("errors.deliveryFailed", { directContact });
    }
  }

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear the field's error as soon as the visitor starts correcting it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values, t);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      // Take the visitor straight to the first field that needs attention.
      const firstInvalid = FIELD_IDS.find(([key]) => nextErrors[key]);
      if (firstInvalid) document.getElementById(firstInvalid[1])?.focus();
      return;
    }

    setStatus("sending");
    setSubmitError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The page's language is shown to the team in the enquiry email.
        body: JSON.stringify({ ...values, locale }),
      });
      if (response.status === 429) {
        setStatus("idle");
        setSubmitError(submitErrorText("rate_limited"));
        return;
      }
      if (!response.ok) {
        // The server says what happened with a code (its `error` text is
        // English); the visitor reads it in the page's language.
        const data = (await response.json().catch(() => null)) as {
          code?: string;
        } | null;
        setStatus("idle");
        setSubmitError(submitErrorText(data?.code));
        return;
      }
      setStatus("success");
      track("Contact Submitted");
    } catch {
      setStatus("idle");
      setSubmitError(submitErrorText("delivery_failed"));
    }
  }

  function reset() {
    setValues(EMPTY_VALUES);
    setErrors({});
    setSubmitError(null);
    setStatus("idle");
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-96 flex-col items-center justify-center text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: 0.1,
            }}
            className="flex size-16 items-center justify-center rounded-full bg-gold-500 text-navy-900"
          >
            <Check className="size-8" aria-hidden strokeWidth={2.5} />
          </motion.span>
          <h3 className="mt-6">{t("success.title")}</h3>
          <p className="mt-3 max-w-sm text-ink-500">{t("success.body")}</p>
          <Button variant="outline" size="sm" className="mt-8" onClick={reset}>
            {t("success.again")}
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          // A submit before the JavaScript loads must not put the visitor's
          // details in the URL (and the server logs).
          method="post"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t("fields.name")}
              htmlFor="contact-name"
              required
              error={errors.name}
            >
              <Input
                id="contact-name"
                name="name"
                autoComplete="name"
                maxLength={CONTACT_LIMITS.name}
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                aria-invalid={errors.name ? true : undefined}
              />
            </Field>
            <Field
              label={t("fields.email")}
              htmlFor="contact-email"
              required
              error={errors.email}
            >
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={CONTACT_LIMITS.email}
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
              />
            </Field>
          </div>

          <Field
            label={t("fields.phone")}
            htmlFor="contact-phone"
            error={errors.phone}
          >
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={CONTACT_LIMITS.phone}
              placeholder={PHONE_PLACEHOLDER}
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              aria-invalid={errors.phone ? true : undefined}
            />
          </Field>

          {/* Option values stay English: they are what the enquiry email shows. */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t("fields.propertyType")}
              htmlFor="contact-property-type"
            >
              <Select
                id="contact-property-type"
                name="propertyType"
                value={values.propertyType}
                onChange={(e) => update("propertyType", e.target.value)}
              >
                <option value="">{t("pleaseSelect")}</option>
                <option value="villa">{t("propertyTypes.villa")}</option>
                <option value="apartment">
                  {t("propertyTypes.apartment")}
                </option>
                <option value="several">{t("propertyTypes.several")}</option>
              </Select>
            </Field>
            <Field
              label={t("fields.propertyCount")}
              htmlFor="contact-property-count"
            >
              <Select
                id="contact-property-count"
                name="propertyCount"
                value={values.propertyCount}
                onChange={(e) => update("propertyCount", e.target.value)}
              >
                <option value="">{t("pleaseSelect")}</option>
                <option value="1">{t("propertyCounts.one")}</option>
                <option value="2-5">{t("propertyCounts.twoToFive")}</option>
                <option value="6+">{t("propertyCounts.sixPlus")}</option>
              </Select>
            </Field>
          </div>

          <Field
            label={t("fields.message")}
            htmlFor="contact-message"
            required
            error={errors.message}
          >
            <Textarea
              id="contact-message"
              name="message"
              placeholder={t("messagePlaceholder")}
              value={values.message}
              onChange={(e) => update("message", e.target.value)}
              aria-invalid={errors.message ? true : undefined}
            />
          </Field>

          {/* Honeypot: off-screen (not display:none) so bots still fill it in. */}
          <div
            aria-hidden="true"
            className="absolute -left-[10000px] top-auto size-px overflow-hidden"
          >
            <label htmlFor="contact-hp-extra">{t("honeypot")}</label>
            <input
              id="contact-hp-extra"
              name="hp_extra"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values.hp_extra}
              onChange={(e) => update("hp_extra", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="contact-consent"
              className="flex items-start gap-3 text-sm text-ink-900"
            >
              <Checkbox
                id="contact-consent"
                name="consent"
                checked={values.consent}
                onChange={(e) => update("consent", e.target.checked)}
                aria-invalid={errors.consent ? true : undefined}
                className="mt-0.5"
              />
              {/* The API logs this sentence, in the page's language, as the consent record. */}
              <span>
                {t.rich("consent", {
                  link: (chunks) => (
                    <Link
                      href="/privacy"
                      className="text-navy-900 underline decoration-gold-500 underline-offset-2 hover:text-gold-700"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
                <span className="text-gold-700"> *</span>
              </span>
            </label>
            {errors.consent ? (
              <p role="alert" className="text-xs text-danger-700">
                {errors.consent}
              </p>
            ) : null}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={status === "sending"}
            >
              {status === "sending" ? t("sending") : t("submit")}
            </Button>
          </div>

          {submitError ? (
            <p
              role="alert"
              className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger-700"
            >
              {submitError}
            </p>
          ) : null}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
