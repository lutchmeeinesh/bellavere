import { cn } from "@/lib/utils";

/**
 * Base surface: white card, 1rem radius, thin sand border. `lift` adds the
 * standard hover treatment (rise 4px + soft shadow).
 */
export function Card({
  className,
  lift = false,
  children,
}: {
  className?: string;
  lift?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-sand-300 bg-white",
        lift &&
          "transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-(--shadow-lift)",
        className
      )}
    >
      {children}
    </div>
  );
}
