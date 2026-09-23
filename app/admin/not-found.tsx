import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * In-shell 404 for the admin area — unknown owner ids and unknown admin
 * pages (middleware.ts rewrites the latter to an owner id that doesn't exist).
 */
export default function AdminNotFound() {
  return (
    <div className="flex justify-center py-16 lg:py-24">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-2xl lg:text-3xl">No such owner or page</h1>
        <p className="mt-3 text-sm text-ink-500">
          This owner record or admin page doesn&apos;t exist. The link may be
          mistyped, or the owner may have been removed.
        </p>
        <Button href="/admin" variant="dark" className="mt-6">
          Back to admin overview
        </Button>
      </Card>
    </div>
  );
}
