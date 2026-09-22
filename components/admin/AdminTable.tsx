import { cn } from "@/lib/utils";

/** Card-framed, horizontally scrollable table used across the admin area. */
export function AdminTable({
  caption,
  head,
  children,
  className,
}: {
  /** Visually hidden table caption for screen readers. */
  caption: string;
  head: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-sand-300 bg-white",
        className
      )}
    >
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-sand-300 bg-sand-50">
            {head.map((label) => (
              <th
                key={label}
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-(--tracking-label) text-ink-500 uppercase"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-300/70">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
