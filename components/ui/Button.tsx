import { LocaleLink } from "@/components/i18n/LocaleLink";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/buttonClasses";

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

  const classes = buttonClasses({ variant, size, className });

  // Internal hrefs are written without a locale ("/contact"); the link adds
  // the page's locale ("/fr/contact"). Portal paths and external, mailto:,
  // tel: and #anchor links are left as they are.
  if ("href" in rest && typeof rest.href === "string") {
    const { href, target } = rest as ButtonAsLink;
    return (
      <LocaleLink href={href} target={target} className={classes}>
        {children}
      </LocaleLink>
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
