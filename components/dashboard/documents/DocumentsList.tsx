"use client";

import { useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Download,
  FileText,
  Folder,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { DocumentCategory, OwnerDocument } from "@/lib/types";
import { daysUntil } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";

export type DocumentRow = OwnerDocument & { propertyName: string | null };

type CategoryFilter = "all" | DocumentCategory;

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "contract", label: "Contracts" },
  { value: "insurance", label: "Insurance" },
  { value: "compliance", label: "Compliance" },
  { value: "other", label: "Other" },
];

const CATEGORY_ICONS: Record<DocumentCategory, LucideIcon> = {
  contract: FileText,
  insurance: Shield,
  compliance: BadgeCheck,
  other: Folder,
};

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  contract: "Contract",
  insurance: "Insurance",
  compliance: "Compliance",
  other: "Other",
};

function formatSize(kb: number): string {
  return kb >= 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function DocumentsList({ docs }: { docs: DocumentRow[] }) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [noteDocId, setNoteDocId] = useState<string | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = useMemo(() => {
    const matched =
      filter === "all" ? docs : docs.filter((d) => d.category === filter);
    // Expiring soonest first; documents that never expire go last.
    return [...matched].sort((a, b) => {
      if (a.expiresAt === null && b.expiresAt === null)
        return a.name.localeCompare(b.name);
      if (a.expiresAt === null) return 1;
      if (b.expiresAt === null) return -1;
      return a.expiresAt.localeCompare(b.expiresAt);
    });
  }, [docs, filter]);

  const showNote = (docId: string) => {
    setNoteDocId(docId);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNoteDocId(null), 4000);
  };

  return (
    <div>
      <div
        className="mb-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter documents by category"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
              filter === f.value
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-sand-300 bg-white text-ink-500 hover:border-navy-900/40 hover:text-navy-900"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Folder className="size-8 text-ink-500/50" aria-hidden />
          <p className="font-medium text-navy-900">No documents here</p>
          <p className="max-w-sm text-sm text-ink-500">
            There are no documents in this category for your portfolio.
          </p>
        </Card>
      ) : (
        <RevealStagger as="ul" className="space-y-3">
          {visible.map((doc) => {
            const Icon = CATEGORY_ICONS[doc.category];
            const days = doc.expiresAt ? daysUntil(doc.expiresAt) : null;
            return (
              <RevealItem key={doc.id} as="li">
                <Card className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sand-100 text-navy-900">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-navy-900">{doc.name}</p>
                        <p className="mt-0.5 text-sm text-ink-500">
                          {doc.propertyName ?? "Portfolio"} ·{" "}
                          {CATEGORY_LABELS[doc.category]} ·{" "}
                          {formatSize(doc.fileSizeKb)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:shrink-0">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-500">
                          Issued
                        </p>
                        <p className="mt-0.5 text-ink-900">
                          {formatDate(doc.issuedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-500">
                          Expires
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-ink-900">
                          {doc.expiresAt ? formatDate(doc.expiresAt) : "—"}
                          {days !== null && days <= 0 ? (
                            <Badge tone="danger">Expired</Badge>
                          ) : days !== null && days <= 45 ? (
                            <Badge tone="warning">Expiring soon</Badge>
                          ) : null}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showNote(doc.id)}
                        aria-label={`Download ${doc.name}`}
                      >
                        <Download className="size-4" aria-hidden />
                        Download
                      </Button>
                    </div>
                  </div>
                  <p aria-live="polite" className="text-right">
                    {noteDocId === doc.id ? (
                      <span className="mt-2 inline-block text-xs text-ink-500">
                        Demo document — no file attached
                      </span>
                    ) : null}
                  </p>
                </Card>
              </RevealItem>
            );
          })}
        </RevealStagger>
      )}
    </div>
  );
}
