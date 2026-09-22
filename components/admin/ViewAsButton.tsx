import { Button } from "@/components/ui/Button";

/**
 * Opens an owner's portal as an admin (plain form POST, works without JS).
 * An empty clientId returns to the admin overview instead.
 */
export function ViewAsButton({
  clientId,
  label = "Open portal",
  variant = "outline",
  size = "sm",
  className,
}: {
  clientId: string;
  label?: string;
  variant?: "primary" | "dark" | "outline" | "light" | "ghost";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <form method="post" action="/api/admin/view-as" className={className}>
      <input type="hidden" name="clientId" value={clientId} />
      <Button type="submit" variant={variant} size={size}>
        {label}
      </Button>
    </form>
  );
}
