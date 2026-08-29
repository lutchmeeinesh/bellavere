import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "dark" | "outline" | "light" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

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

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & { href: string; target?: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide",
    "transition-all duration-200 ease-out cursor-pointer select-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, target } = rest as ButtonAsLink;
    return (
      <Link href={href} target={target} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      className={classes}
    >
      {children}
    </button>
  );
}
