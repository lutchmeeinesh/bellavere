"use client";

import { useState } from "react";
import { CircleAlert } from "lucide-react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "success";

/** Footer newsletter signup: validates, POSTs to /api/newsletter, announces the result. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, company_website: honeypot }),
      });
      if (response.status === 429) {
        setStatus("idle");
        setError("Too many attempts. Please wait a few minutes and try again.");
        return;
      }
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
    }
  }

  const sending = status === "sending";

  return (
    <div>
      <form
        className="mt-3 flex max-w-sm gap-2"
        aria-label="Newsletter signup"
        onSubmit={handleSubmit}
        noValidate
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          disabled={sending}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-gold-500 focus:outline-none disabled:opacity-60"
        />
        {/* Honeypot: off-screen (not display:none) so bots still fill it in. */}
        <div
          aria-hidden="true"
          className="absolute -left-[10000px] top-auto size-px overflow-hidden"
        >
          <label htmlFor="newsletter-company-website">Company website</label>
          <input
            id="newsletter-company-website"
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-medium text-navy-900 transition-colors duration-200 hover:bg-gold-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      <div aria-live="polite" className="mt-2 min-h-5 text-xs">
        {status === "success" ? (
          <p className="text-gold-500">Thank you — you’re on the list.</p>
        ) : error ? (
          <p
            id="newsletter-error"
            className="flex items-center gap-1.5 text-sand-100"
          >
            {/* Red on navy fails contrast for text, so the colour cue sits
                on the icon and the message stays light. */}
            <CircleAlert className="size-3.5 shrink-0 text-danger" aria-hidden />
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
