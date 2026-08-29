import { cn } from "@/lib/utils";

/** Loading placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-xl bg-sand-100", className)}
    />
  );
}
