import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** In-shell 404 — shown when a page or another owner's property is requested. */
export default function DashboardNotFound() {
  return (
    <div className="flex justify-center py-16 lg:py-24">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-2xl lg:text-3xl">Nothing here</h1>
        <p className="mt-3 text-sm text-ink-500">
          This page or property isn&apos;t in your portfolio. If you believe it
          should be, get in touch with Ankit, your Bellavere client-relations contact.
        </p>
        <Button href="/dashboard" variant="dark" className="mt-6">
          Back to overview
        </Button>
      </Card>
    </div>
  );
}
