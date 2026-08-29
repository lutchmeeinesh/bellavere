"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

/**
 * Profile details card. Demo only: edits live in local state — a real app
 * would PATCH the client record and revalidate.
 */
export function ProfileSettings({
  initial,
}: {
  initial: { name: string; email: string; phone: string };
}) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 4000);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl">Profile</h2>
      <p className="mt-1 text-sm text-ink-500">
        How we address you and where we send your statements.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Field label="Full name" htmlFor="profile-name">
          <Input
            id="profile-name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </Field>
        <Field label="Email" htmlFor="profile-email">
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </Field>
        <Field label="Phone" htmlFor="profile-phone">
          <Input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </Field>
        <div className="flex items-center gap-4 pt-1">
          <Button type="submit">Save changes</Button>
          <span aria-live="polite">
            <AnimatePresence>
              {saved ? (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex items-center gap-1.5 text-sm text-success"
                >
                  <CheckCircle2 className="size-4" aria-hidden />
                  Saved — demo only
                </motion.span>
              ) : null}
            </AnimatePresence>
          </span>
        </div>
      </form>
    </Card>
  );
}
