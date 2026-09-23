"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** Error boundary for the admin area, inside the admin shell. */
export default function AdminError({
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

  // refresh() refetches the server components, so reset() really retries.
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
          Please try again. If it keeps failing,{" "}
          {error.digest
            ? "search the Vercel logs for the reference below."
            : "the browser console has the details."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" variant="dark" onClick={retry}>
            Try again
          </Button>
          <Button href="/admin" variant="outline">
            Back to admin overview
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs text-ink-500">Reference: {error.digest}</p>
        ) : null}
      </Card>
    </div>
  );
}
