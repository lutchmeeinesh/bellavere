"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";

const contact = company.contacts[0];

/**
 * Error boundary for the owner portal. It renders inside the dashboard
 * shell (the layout stays around it), so the sidebar keeps working. The
 * error's message is never shown; the digest points to it in the server logs.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // reset() re-renders the page; refresh() refetches its server components
  // too, so an error that came from the server is really retried.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div className="flex justify-center py-16 lg:py-24">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-2 text-2xl lg:text-3xl">This page didn&rsquo;t load</h1>
        <p className="mt-3 text-sm text-ink-500">
          Something on our side stopped it from loading. Please try again — or
          call {contact.name.split(" ")[0]}, your {company.name}{" "}
          client-relations contact, on{" "}
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="inline-block py-1 font-medium whitespace-nowrap text-navy-900 underline decoration-sand-300 underline-offset-4 hover:decoration-gold-500"
          >
            {contact.phone}
          </a>
          {company.hours ? ` (${company.hours.toLowerCase()})` : null}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" variant="dark" onClick={retry}>
            Try again
          </Button>
          <Button href="/dashboard" variant="outline">
            Back to overview
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs text-ink-500">Reference: {error.digest}</p>
        ) : null}
      </Card>
    </div>
  );
}
