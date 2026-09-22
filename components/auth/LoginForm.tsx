"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, Field, Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const DEMO_ACCOUNTS = [
  {
    email: "sophie@demo.bellavere.com",
    name: "Sophie Laurent",
    note: "3 properties",
  },
  {
    email: "ravi@demo.bellavere.com",
    name: "Ravi Naidoo",
    note: "1 villa",
  },
  {
    email: "hamilton@demo.bellavere.com",
    name: "Hamilton Estates Ltd",
    note: "5 apartments",
  },
] as const;

const DEMO_PASSWORD = "demo1234";

/**
 * Sign-in card for owners and Bellavere admins: credentials, remember-me, and
 * one-click demo accounts while demo mode is on.
 */
export function LoginForm({
  from,
  demoMode,
}: {
  from?: string;
  /** Show the demo-account shortcuts (DEMO_MODE is not "false"). */
  demoMode: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  async function signIn(credentials: {
    email: string;
    password: string;
    remember: boolean;
  }) {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        redirect?: string;
      } | null;
      if (response.ok) {
        // The server says where this account belongs (/admin or /dashboard);
        // a deep link is honoured only if it lives in that same area.
        const home = data?.redirect ?? "/dashboard";
        const target = from && from.startsWith(home) ? from : home;
        // Keep the button in its loading state while we navigate away.
        router.push(target);
        router.refresh();
        return;
      }
      setError(
        data?.error ?? "That email and password don’t match our records.",
      );
      setShakeCount((count) => count + 1);
      setSubmitting(false);
    } catch {
      setError(
        "Something went wrong. Please check your connection and try again.",
      );
      setShakeCount((count) => count + 1);
      setSubmitting(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void signIn({ email, password, remember });
  }

  function fillAndSubmitDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    void signIn({ email: demoEmail, password: DEMO_PASSWORD, remember });
  }

  return (
    // Remounting on each failed attempt re-triggers the shake animation.
    <Card
      key={shakeCount}
      className={cn("w-full p-6 sm:p-8", shakeCount > 0 && "animate-shake")}
    >
      <h1 className="text-3xl">Owner portal</h1>
      <p className="mt-2 text-sm text-ink-500">
        Sign in to see how your property is performing.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Field label="Email" htmlFor="login-email">
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="login-password">
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-ink-500 transition-colors duration-150 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              {showPassword ? (
                <EyeOff className="size-4.5" aria-hidden />
              ) : (
                <Eye className="size-4.5" aria-hidden />
              )}
            </button>
          </div>
        </Field>

        <label
          htmlFor="login-remember"
          className="flex items-center gap-2.5 text-sm text-ink-900"
        >
          <Checkbox
            id="login-remember"
            name="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger-700"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {demoMode ? (
        <div className="mt-8 border-t border-sand-300 pt-6">
          <div className="rounded-xl bg-sand-100 p-4">
            <p className="text-xs font-medium text-navy-900">
              Demo accounts — password{" "}
              <code className="font-mono text-gold-700">{DEMO_PASSWORD}</code>
            </p>
            <ul className="mt-3 space-y-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <li
                  key={account.email}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-ink-900">
                      {account.name}
                      <span className="font-normal text-ink-500">
                        {" "}
                        · {account.note}
                      </span>
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {account.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillAndSubmitDemo(account.email)}
                    disabled={submitting}
                    aria-label={`Sign in as ${account.name}`}
                    className="shrink-0 cursor-pointer rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-xs font-medium text-navy-900 transition-colors duration-150 hover:border-gold-500 hover:text-gold-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:opacity-50"
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
