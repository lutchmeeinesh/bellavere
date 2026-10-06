import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "dark" | "outline" | "light" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gold-500 text-navy-900 hover:bg-gold-600 hover:text-white shadow-none",
  dark: "bg-navy-900 text-white hover:bg-navy-700",
  outline:
    "border border-navy-900/25 text-navy-900 hover:border-navy-900 hover:bg-navy-900 hover:text-white",
  light:
    "border border-white/40 text-white hover:bg-white hover:text-navy-900",
  ghost: "text-navy-900 hover:bg-sand-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

/**
 * The classes of the site's pill buttons (components/ui/Button.tsx), for a
 * plain <a> or <button> where the Button component does not fit: pages with
 * no client JavaScript (the 404 page) and the error page, which keeps its
 * own bundle small.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide",
    "transition-all duration-200 ease-out cursor-pointer select-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}
