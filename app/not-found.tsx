import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/site/Logo";

export const metadata: Metadata = {
  title: "Page not found",
};

/** Root 404 — renders without the site chrome, so it carries its own frame. */
export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-sand-50 px-5 py-24 text-center">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Logo />
      </div>

      <p
        aria-hidden
        className="font-serif text-[8rem] leading-none font-semibold text-gold-500/20 select-none sm:text-[11rem]"
      >
        404
      </p>
      <h1 className="-mt-8 sm:-mt-12">Lost at sea?</h1>
      <p className="mt-5 max-w-md text-lg text-ink-500">
        The page you’re looking for has drifted off with the tide. The coast,
        happily, is easy to find again.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button href="/">Back to the beach house</Button>
        <Button href="/contact" variant="outline">
          Contact us
        </Button>
      </div>
    </div>
  );
}
