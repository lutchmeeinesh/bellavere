import { cn } from "@/lib/utils";

/**
 * Standard header block at the top of dashboard page content:
 * optional title/sub on the left, action buttons on the right.
 */
export function PageHeader({
  title,
  sub,
  actions,
  className,
}: {
  title?: string;
  sub?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        {title ? <h1 className="text-3xl lg:text-4xl">{title}</h1> : null}
        {sub ? <p className="mt-1.5 text-sm text-ink-500">{sub}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
    </div>
  );
}
