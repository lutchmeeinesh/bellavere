"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/site/Logo";
import { company } from "@/data/company";

const LINK =
  "inline-block py-1 font-medium text-navy-900 underline decoration-sand-300 underline-offset-4 transition-colors duration-150 hover:decoration-gold-500";

/**
 * Root error boundary: anything a page throws below the root layout lands
 * here. It replaces the site chrome, so like the 404 page it carries its own
 * frame, and it always offers a person to call. The error's message is never
 * shown (it can carry internal details); the digest lets us find it in the
 * server logs.
 */
export default function SiteError({
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

  // reset() re-renders the segment; refresh() refetches its server
  // components too, so an error that came from the server is really retried.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div className="relative flex min-h-svh flex-col justify-center bg-sand-50 py-24 text-center">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Logo />
      </div>

      <Container>
        <p className="eyebrow mb-4">Something went wrong</p>
        <h1 className="mx-auto max-w-2xl">Sorry, this page didn&rsquo;t load</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-ink-500">
          Something on our side stopped it from loading. Please try again —
          and if it keeps happening, a real person is always there to help.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button type="button" onClick={retry}>
            Try again
          </Button>
          <Button href="/" variant="outline">
            Back to the home page
          </Button>
          <Button href="/contact" variant="ghost">
            Contact us
          </Button>
        </div>

        <div className="mt-12 text-sm text-ink-500">
          <p>
            Call us
            {company.hours ? ` — ${company.hours.toLowerCase()}` : null}
          </p>
          <ul className="mt-1">
            {company.contacts.map((person) => (
              <li key={person.name}>
                {person.name.split(" ")[0]}{" "}
                <a href={`tel:${person.phone.replace(/\s/g, "")}`} className={LINK}>
                  {person.phone}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            or write to{" "}
            <a href={`mailto:${company.email}`} className={LINK}>
              {company.email}
            </a>
          </p>
        </div>

        {error.digest ? (
          <p className="mt-10 text-xs text-ink-500">Reference: {error.digest}</p>
        ) : null}
      </Container>
    </div>
  );
}
