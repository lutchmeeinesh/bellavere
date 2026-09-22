import { cn } from "@/lib/utils";

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold"
  | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-success/10 text-success-700",
  warning: "bg-warning/10 text-warning-700",
  danger: "bg-danger/10 text-danger-700",
  info: "bg-sea-500/10 text-sea-700",
  gold: "bg-gold-500/15 text-gold-700",
  neutral: "bg-sand-100 text-ink-500",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
