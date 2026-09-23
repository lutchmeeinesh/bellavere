import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

export const fieldClasses = cn(
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-900",
  "placeholder:text-ink-500/60 transition-colors duration-150",
  "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20"
);

/**
 * `appearance-none` drops the native arrow, so <Select> paints its own
 * chevron (ink-500) as a background image. Fully URL-encoded, with no quotes
 * or spaces, so Tailwind reads it as a single class.
 */
const selectChevron = cn(
  "bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2020%2020%27%20fill=%27none%27%20stroke=%27%23666666%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpath%20d=%27M6%208l4%204%204-4%27/%3E%3C/svg%3E)]",
  "bg-size-[1.25rem] bg-position-[right_0.875rem_center] bg-no-repeat pr-10"
);

export function Input({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClasses, "min-h-32 resize-y", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(fieldClasses, "appearance-none", selectChevron, className)}
      {...props}
    >
      {children}
    </select>
  );
}

type ControlAriaProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-required"?: React.AriaAttributes["aria-required"];
};

/**
 * Label + control + optional error line. When the child is the control the
 * label points at (its `id` equals `htmlFor`), it is linked to the error
 * with aria-describedby and gets aria-invalid / aria-required. A wrapped
 * control (e.g. an input inside a div with a show-password button) must
 * set those itself, pointing at `${htmlFor}-error`.
 */
export function Field({
  label,
  htmlFor,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const errorId = `${htmlFor}-error`;
  let control = children;
  if (
    isValidElement<ControlAriaProps>(children) &&
    children.props.id === htmlFor
  ) {
    const own = children.props;
    control = cloneElement(children, {
      "aria-describedby":
        [own["aria-describedby"], error ? errorId : null]
          .filter(Boolean)
          .join(" ") || undefined,
      "aria-invalid": error ? true : own["aria-invalid"],
      "aria-required": required ? true : own["aria-required"],
    });
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-navy-900"
      >
        {label}
        {required ? <span className="text-gold-700"> *</span> : null}
      </label>
      {control}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 shrink-0 rounded border-sand-300 accent-gold-500",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
        className
      )}
      {...props}
    />
  );
}
