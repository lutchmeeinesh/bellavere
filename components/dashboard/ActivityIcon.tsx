import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  CalendarCheck,
  ClipboardList,
  FileText,
  LogOut,
  Wrench,
} from "lucide-react";
import type { ActivityType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Tinted glyph circle for activity-feed entries. Shared by the overview
 * "Recent activity" card and the topbar notification dropdown so both read
 * the same visual language.
 */

const GLYPHS: Record<ActivityType, { icon: LucideIcon; classes: string }> = {
  booking: { icon: CalendarCheck, classes: "bg-gold-500/15 text-gold-600" },
  checkout: { icon: LogOut, classes: "bg-sand-100 text-ink-500" },
  payout: { icon: Banknote, classes: "bg-success/10 text-success" },
  maintenance: { icon: Wrench, classes: "bg-warning/10 text-warning" },
  inspection: { icon: ClipboardList, classes: "bg-sea-500/10 text-sea-500" },
  document: { icon: FileText, classes: "bg-danger/10 text-danger" },
};

export function ActivityIcon({
  type,
  className,
}: {
  type: ActivityType;
  className?: string;
}) {
  const { icon: Icon, classes } = GLYPHS[type];
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full",
        classes,
        className
      )}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );
}
