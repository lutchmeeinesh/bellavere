"use client";

import { useRef } from "react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Choice<T extends string> = {
  id: T;
  title: string;
  description?: string;
  icon?: LucideIcon;
};

/**
 * Single choice as a radio group of cards (WAI-ARIA radio group pattern):
 * one tab stop, arrow keys move the selection, Home/End jump to the ends.
 * Clicking a card, or pressing Space/Enter on it, also "activates" it —
 * the estimator uses that to move on to the next question.
 *
 * `variant="cards"` stacks icon, title and description (property type,
 * availability); `variant="rows"` is a compact list (regions).
 */
export function ChoiceCards<T extends string>({
  options,
  value,
  onChange,
  onActivate,
  onHighlight,
  labelledBy,
  describedBy,
  variant = "cards",
  className,
}: {
  options: readonly Choice<T>[];
  value: T | undefined;
  onChange: (id: T) => void;
  /** Called after a click / Space / Enter on an option (not on arrow keys). */
  onActivate?: (id: T) => void;
  /** Option under the pointer or keyboard focus (null when none). */
  onHighlight?: (id: T | null) => void;
  labelledBy: string;
  describedBy?: string;
  variant?: "cards" | "rows";
  className?: string;
}) {
  const refs = useRef(new Map<T, HTMLButtonElement>());
  const tabStop = value ?? options[0]?.id;

  function move(from: number, to: number) {
    const count = options.length;
    const next = options[((to % count) + count) % count];
    if (!next || to === from) return;
    onChange(next.id);
    refs.current.get(next.id)?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        move(index, index + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        move(index, index - 1);
        break;
      case "Home":
        event.preventDefault();
        move(index, 0);
        break;
      case "End":
        event.preventDefault();
        move(index, options.length - 1);
        break;
    }
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      onMouseLeave={() => onHighlight?.(null)}
    >
      {options.map((option, index) => {
        const checked = option.id === value;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            ref={(node) => {
              if (node) refs.current.set(option.id, node);
              else refs.current.delete(option.id);
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={option.id === tabStop ? 0 : -1}
            onClick={() => {
              onChange(option.id);
              onActivate?.(option.id);
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
            onMouseEnter={() => onHighlight?.(option.id)}
            onFocus={() => onHighlight?.(option.id)}
            onBlur={() => onHighlight?.(null)}
            className={cn(
              "group relative flex w-full cursor-pointer rounded-2xl border bg-white text-left",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
              variant === "cards"
                ? "flex-col items-start p-5 sm:p-6"
                : "items-center gap-4 px-4 py-3.5 sm:px-5",
              checked
                ? "border-gold-500 bg-gold-500/[0.07] shadow-(--shadow-soft) ring-1 ring-gold-500"
                : "border-sand-300 hover:-translate-y-0.5 hover:border-gold-500/70 hover:shadow-(--shadow-soft)",
            )}
          >
            {variant === "rows" ? <RadioDot checked={checked} /> : null}

            {variant === "cards" && Icon ? (
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-full transition-colors duration-200",
                  checked
                    ? "bg-gold-500 text-navy-900"
                    : "bg-gold-500/15 text-gold-700",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
            ) : null}

            <span className={cn("block", variant === "cards" && "mt-4 pr-6")}>
              <span
                className={cn(
                  "block text-balance text-navy-900",
                  variant === "cards"
                    ? "font-serif text-2xl leading-tight font-semibold"
                    : "font-medium",
                )}
              >
                {option.title}
              </span>
              {option.description ? (
                <span
                  className={cn(
                    "block text-sm text-pretty text-ink-500",
                    variant === "cards" ? "mt-1.5 leading-relaxed" : "mt-0.5",
                  )}
                >
                  {option.description}
                </span>
              ) : null}
            </span>

            {variant === "cards" ? (
              <span className="absolute top-4 right-4 sm:top-5 sm:right-5">
                <RadioDot checked={checked} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** The round check mark of a choice: an empty ring, or gold with a tick. */
function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
        checked
          ? "border-gold-500 bg-gold-500 text-navy-900"
          : "border-sand-300 bg-white group-hover:border-gold-500/70",
      )}
      aria-hidden
    >
      {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
    </span>
  );
}
