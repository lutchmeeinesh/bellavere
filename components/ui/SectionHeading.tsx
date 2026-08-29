import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

/** Eyebrow + serif heading + optional sub-line, used to open sections. */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "left",
  dark = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className={cn("eyebrow mb-4", dark && "eyebrow-light")}>{eyebrow}</p>
      ) : null}
      <h2 className={cn(dark && "text-white")}>{title}</h2>
      {sub ? (
        <p className={cn("mt-5 text-lg", dark ? "text-white/70" : "text-ink-500")}>
          {sub}
        </p>
      ) : null}
    </Reveal>
  );
}
