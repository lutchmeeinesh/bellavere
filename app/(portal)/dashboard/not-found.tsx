import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Page not found",
};

const contact = company.contacts[0];

/**
 * In-shell 404 — shown for unknown portal pages and for any property outside
 * the owner's portfolio (app/dashboard/[...missing] via middleware.ts). The
 * wording is the same for both, so it never confirms that a property exists.
 */
export default function DashboardNotFound() {
  return (
    <div className="flex justify-center py-16 lg:py-24">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-2xl lg:text-3xl">Nothing here</h1>
        <p className="mt-3 text-sm text-ink-500">
          This page or property isn&apos;t in your portfolio. If you believe it
          should be, get in touch with {contact.name.split(" ")[0]}, your{" "}
          {company.name} client-relations contact, on{" "}
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="inline-block py-1 font-medium whitespace-nowrap text-navy-900 underline decoration-sand-300 underline-offset-4 hover:decoration-gold-500"
          >
            {contact.phone}
          </a>
          .
        </p>
        <Button href="/dashboard" variant="dark" className="mt-6">
          Back to overview
        </Button>
      </Card>
    </div>
  );
}
