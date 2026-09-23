"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { company } from "@/data/company";
import { CONTACT_LIMITS, EMAIL_PATTERN } from "@/lib/contactLimits";
import { Button } from "@/components/ui/Button";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/Input";

/** Shown if the message cannot be sent, so no enquiry is silently lost. */
const FALLBACK_ERROR = `We couldn’t send your message just now. Please email ${company.email} or call ${company.contacts
  .map((person) => `${person.name.split(" ")[0]} on ${person.phone}`)
  .join(" or ")} — we answer the same day.`;

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

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = "Please tell us your name.";
  } else if (values.name.trim().length > CONTACT_LIMITS.name) {
    errors.name = `Please keep your name under ${CONTACT_LIMITS.name} characters.`;
  }
  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (
    values.email.trim().length > CONTACT_LIMITS.email ||
    !EMAIL_PATTERN.test(values.email.trim())
  ) {
    errors.email = "Please enter a valid email address.";
  }
  if (values.phone.trim().length > CONTACT_LIMITS.phone) {
    errors.phone = `Please keep the phone number under ${CONTACT_LIMITS.phone} characters.`;
  }
  const messageLength = values.message.trim().length;
  if (!messageLength) {
    errors.message = "Please tell us a little about your property.";
  } else if (messageLength > CONTACT_LIMITS.message) {
    errors.message = `Please keep your message under ${CONTACT_LIMITS.message.toLocaleString("en-GB")} characters (it is ${messageLength.toLocaleString("en-GB")}).`;
  }
  if (!values.consent) {
    errors.consent = "Please confirm we may contact you about your enquiry.";
  }
  return errors;
}

/** Contact enquiry form: client-side validation, POST to /api/contact, animated success state. */
export function ContactForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear the field's error as soon as the visitor starts correcting it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
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
        body: JSON.stringify(values),
      });
      if (response.status === 429) {
        setStatus("idle");
        setSubmitError(
          "You’ve sent several messages in a short time. Please wait a few minutes and try again, or email us directly.",
        );
        return;
      }
      if (!response.ok) {
        // The server explains what happened and gives direct contacts.
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setStatus("idle");
        setSubmitError(data?.error ?? FALLBACK_ERROR);
        return;
      }
      setStatus("success");
    } catch {
      setStatus("idle");
      setSubmitError(FALLBACK_ERROR);
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
          <h3 className="mt-6">Message received</h3>
          <p className="mt-3 max-w-sm text-ink-500">
            Thank you — a real person from our team will read your message and
            reply the same day.
          </p>
          <Button variant="outline" size="sm" className="mt-8" onClick={reset}>
            Send another message
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
              label="Name"
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
              label="Email"
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

          <Field label="Phone" htmlFor="contact-phone" error={errors.phone}>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={CONTACT_LIMITS.phone}
              placeholder="+230 …"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              aria-invalid={errors.phone ? true : undefined}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Property type" htmlFor="contact-property-type">
              <Select
                id="contact-property-type"
                name="propertyType"
                value={values.propertyType}
                onChange={(e) => update("propertyType", e.target.value)}
              >
                <option value="">Please select</option>
                <option value="villa">Villa</option>
                <option value="apartment">Apartment</option>
                <option value="several">Several properties</option>
              </Select>
            </Field>
            <Field
              label="Number of properties"
              htmlFor="contact-property-count"
            >
              <Select
                id="contact-property-count"
                name="propertyCount"
                value={values.propertyCount}
                onChange={(e) => update("propertyCount", e.target.value)}
              >
                <option value="">Please select</option>
                <option value="1">1</option>
                <option value="2-5">2–5</option>
                <option value="6+">6+</option>
              </Select>
            </Field>
          </div>

          <Field
            label="Message"
            htmlFor="contact-message"
            required
            error={errors.message}
          >
            <Textarea
              id="contact-message"
              name="message"
              placeholder="Where is your property, and what would you like help with?"
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
            <label htmlFor="contact-hp-extra">Leave this field empty</label>
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
              <span>
                I agree to be contacted about my enquiry, as described in the{" "}
                <Link
                  href="/privacy"
                  className="text-navy-900 underline decoration-gold-500 underline-offset-2 hover:text-gold-700"
                >
                  privacy policy
                </Link>
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
              {status === "sending" ? "Sending…" : "Send message"}
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
