import { cn } from "@/lib/utils";

export const fieldClasses = cn(
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink-900",
  "placeholder:text-ink-500/60 transition-colors duration-150",
  "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20"
);

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
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
    <select className={cn(fieldClasses, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

/** Label + control + optional error line. */
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
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-navy-900"
      >
        {label}
        {required ? <span className="text-gold-700"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger-700">
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
