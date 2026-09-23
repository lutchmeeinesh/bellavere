"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

type FieldKey = "current" | "next" | "confirm";

/** Password input with a show/hide toggle button. */
function PasswordInput({
  id,
  value,
  onChange,
  invalid,
  autoComplete,
  "aria-describedby": describedBy,
  "aria-required": ariaRequired,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  autoComplete: string;
  /** Set by <Field>, which links its error line to the control. */
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        aria-required={ariaRequired}
        onChange={(e) => onChange(e.target.value)}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-500 transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

/**
 * Change password card. Mock only: nothing is stored or checked against the
 * demo account — a real app would verify the current password server-side.
 */
export function PasswordSettings() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    current: "",
    next: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [success, setSuccess] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setValue = (key: FieldKey) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.current) nextErrors.current = "Enter your current password.";
    if (!values.next) {
      nextErrors.next = "Enter a new password.";
    } else if (values.next.length < 8) {
      nextErrors.next = "New password must be at least 8 characters.";
    }
    if (!values.confirm) {
      nextErrors.confirm = "Confirm your new password.";
    } else if (values.next && values.confirm !== values.next) {
      nextErrors.confirm = "Passwords do not match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSuccess(false);
      return;
    }

    setValues({ current: "", next: "", confirm: "" });
    setSuccess(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl">Change password</h2>
      <p className="mt-1 text-sm text-ink-500">
        Use at least 8 characters. You will stay signed in on this device.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <Field
          label="Current password"
          htmlFor="password-current"
          error={errors.current}
          required
        >
          <PasswordInput
            id="password-current"
            value={values.current}
            onChange={setValue("current")}
            invalid={Boolean(errors.current)}
            autoComplete="current-password"
          />
        </Field>
        <Field
          label="New password"
          htmlFor="password-new"
          error={errors.next}
          required
        >
          <PasswordInput
            id="password-new"
            value={values.next}
            onChange={setValue("next")}
            invalid={Boolean(errors.next)}
            autoComplete="new-password"
          />
        </Field>
        <Field
          label="Confirm new password"
          htmlFor="password-confirm"
          error={errors.confirm}
          required
        >
          <PasswordInput
            id="password-confirm"
            value={values.confirm}
            onChange={setValue("confirm")}
            invalid={Boolean(errors.confirm)}
            autoComplete="new-password"
          />
        </Field>
        <div className="flex items-center gap-4 pt-1">
          <Button type="submit">Update password</Button>
          <span aria-live="polite">
            <AnimatePresence>
              {success ? (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex items-center gap-1.5 text-sm text-success-700"
                >
                  <CheckCircle2 className="size-4" aria-hidden />
                  Password updated — demo only
                </motion.span>
              ) : null}
            </AnimatePresence>
          </span>
        </div>
      </form>
    </Card>
  );
}
