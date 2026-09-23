"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, HardHat, Plus } from "lucide-react";
import type {
  MaintenanceTicket,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";
import { todayIso } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useMoney } from "@/components/currency/CurrencyProvider";

type PropertyOption = { id: string; name: string };

const PRIORITY_META: Record<TicketPriority, { label: string; tone: BadgeTone }> =
  {
    urgent: { label: "Urgent", tone: "danger" },
    high: { label: "High", tone: "warning" },
    medium: { label: "Medium", tone: "info" },
    low: { label: "Low", tone: "neutral" },
  };

const CATEGORIES = [
  "Pool",
  "Garden",
  "Air conditioning",
  "Electrical",
  "Plumbing",
  "Exterior",
  "General",
];

const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

const COLUMNS: { status: TicketStatus; title: string }[] = [
  { status: "reported", title: "Reported" },
  { status: "in_progress", title: "In progress" },
  { status: "resolved", title: "Resolved" },
];

function TicketCard({
  ticket,
  propertyName,
}: {
  ticket: MaintenanceTicket;
  propertyName: string;
}) {
  const money = useMoney();
  const priority = PRIORITY_META[ticket.priority];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <Badge tone={priority.tone}>{priority.label}</Badge>
        <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-ink-500">
          {ticket.category}
        </span>
      </div>
      <p className="mt-3 font-medium text-navy-900">{ticket.title}</p>
      <p className="mt-1 text-sm text-ink-500">{propertyName}</p>
      <div className="mt-3 space-y-1.5 text-sm text-ink-500">
        <p>Reported {formatDate(ticket.reportedAt)}</p>
        {ticket.contractor ? (
          <p className="flex items-center gap-1.5">
            <HardHat className="size-4 shrink-0" aria-hidden />
            {ticket.contractor}
          </p>
        ) : null}
        {ticket.status === "resolved" && ticket.cost != null ? (
          <p className="font-medium text-navy-900">
            {money.format(ticket.cost)}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

export function MaintenanceBoard({
  clientId,
  initial,
  properties,
}: {
  clientId: string;
  initial: {
    reported: MaintenanceTicket[];
    in_progress: MaintenanceTicket[];
    resolved: MaintenanceTicket[];
  };
  properties: PropertyOption[];
}) {
  // Only the Reported column changes in this demo (new tickets are prepended
  // locally — a real app would POST to an API and revalidate).
  const [reported, setReported] = useState(initial.reported);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const confirmationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    propertyId: "",
    title: "",
    category: "",
    priority: "" as "" | TicketPriority,
    description: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>(
    {}
  );

  const propertyName = (id: string) =>
    properties.find((p) => p.id === id)?.name ?? "Property";

  const columnTickets: Record<TicketStatus, MaintenanceTicket[]> = {
    reported,
    in_progress: initial.in_progress,
    resolved: initial.resolved,
  };

  const resetForm = () => {
    setForm({
      propertyId: "",
      title: "",
      category: "",
      priority: "",
      description: "",
    });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!form.propertyId) nextErrors.propertyId = "Choose a property.";
    if (!form.title.trim()) nextErrors.title = "Give the issue a short title.";
    if (!form.category) nextErrors.category = "Choose a category.";
    if (!form.priority) nextErrors.priority = "Choose a priority.";
    if (!form.description.trim())
      nextErrors.description = "Describe what you have noticed.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Demo only: prepend locally. A real app would POST this ticket to an API
    // and let the server assign an id and notify the property care team.
    const ticket: MaintenanceTicket = {
      id: `t-demo-${Date.now()}`,
      propertyId: form.propertyId,
      clientId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority as TicketPriority,
      status: "reported",
      reportedAt: todayIso(),
    };
    setReported((current) => [ticket, ...current]);
    setModalOpen(false);
    resetForm();
    setConfirmation(
      `Issue reported for ${propertyName(ticket.propertyId)} — this is a demo, so it is not sent to Bellavere.`
    );
    if (confirmationTimer.current) clearTimeout(confirmationTimer.current);
    confirmationTimer.current = setTimeout(() => setConfirmation(null), 5000);
  };

  return (
    <div>
      <PageHeader
        title="Maintenance"
        sub="Every issue across your properties, from report to resolution"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" aria-hidden />
            Report an issue
          </Button>
        }
      />

      <div aria-live="polite">
        <AnimatePresence>
          {confirmation ? (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success-700"
            >
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              {confirmation}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <RevealStagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const tickets = columnTickets[column.status];
          return (
            <RevealItem key={column.status}>
              <section aria-label={`${column.title} tickets`}>
                <header className="mb-4 flex items-center gap-2.5">
                  <h2 className="text-lg">{column.title}</h2>
                  <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-ink-500">
                    {tickets.length}
                  </span>
                </header>
                {column.status === "reported" ? (
                  <ul className="space-y-4">
                    <AnimatePresence initial={false}>
                      {tickets.map((t) => (
                        <motion.li
                          key={t.id}
                          layout
                          initial={{ opacity: 0, scale: 0.92, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        >
                          <TicketCard
                            ticket={t}
                            propertyName={propertyName(t.propertyId)}
                          />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                    {tickets.length === 0 ? (
                      <li className="rounded-2xl border border-dashed border-sand-300 px-5 py-8 text-center text-sm text-ink-500">
                        Nothing reported — all quiet.
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <ul className="space-y-4">
                    {tickets.map((t) => (
                      <li key={t.id}>
                        <TicketCard
                          ticket={t}
                          propertyName={propertyName(t.propertyId)}
                        />
                      </li>
                    ))}
                    {tickets.length === 0 ? (
                      <li className="rounded-2xl border border-dashed border-sand-300 px-5 py-8 text-center text-sm text-ink-500">
                        No tickets here right now.
                      </li>
                    ) : null}
                  </ul>
                )}
              </section>
            </RevealItem>
          );
        })}
      </RevealStagger>

      <p className="mt-6 text-xs text-ink-500">
        Tickets reported here are demo-only and reset on refresh.
      </p>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report an issue"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field
            label="Property"
            htmlFor="ticket-property"
            error={errors.propertyId}
            required
          >
            <Select
              id="ticket-property"
              value={form.propertyId}
              aria-invalid={errors.propertyId ? true : undefined}
              onChange={(e) =>
                setForm((f) => ({ ...f, propertyId: e.target.value }))
              }
            >
              <option value="">Select a property…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Title" htmlFor="ticket-title" error={errors.title} required>
            <Input
              id="ticket-title"
              value={form.title}
              aria-invalid={errors.title ? true : undefined}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Pool pump making a rattling noise"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Category"
              htmlFor="ticket-category"
              error={errors.category}
              required
            >
              <Select
                id="ticket-category"
                value={form.category}
                aria-invalid={errors.category ? true : undefined}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Priority"
              htmlFor="ticket-priority"
              error={errors.priority}
              required
            >
              <Select
                id="ticket-priority"
                value={form.priority}
                aria-invalid={errors.priority ? true : undefined}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as TicketPriority | "",
                  }))
                }
              >
                <option value="">Select…</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field
            label="Description"
            htmlFor="ticket-description"
            error={errors.description}
            required
          >
            <Textarea
              id="ticket-description"
              value={form.description}
              aria-invalid={errors.description ? true : undefined}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="What have you noticed, and since when?"
            />
          </Field>
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
