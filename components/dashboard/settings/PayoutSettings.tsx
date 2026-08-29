import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

/** Payout details card — read-only in the portal by design. */
export function PayoutSettings({ payoutAccount }: { payoutAccount: string }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl">Payout details</h2>
      <p className="mt-1 text-sm text-ink-500">
        Where your monthly net payout is sent.
      </p>
      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-sand-300 bg-sand-50 px-4 py-3.5">
        <span className="font-mono text-sm tracking-wide text-navy-900">
          {payoutAccount}
        </span>
        <Badge tone="gold">EUR</Badge>
      </div>
      <p className="mt-3 text-sm text-ink-500">
        Payouts are made monthly by the 5th.
        {/* TODO: confirm with client */}
      </p>
      <div className="mt-5">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-navy-900/25 px-6 py-3 text-sm font-medium tracking-wide text-navy-900 opacity-45"
        >
          Update payout account
        </button>
        <p className="mt-2 text-xs text-ink-500">
          Contact your account manager to change payout details.
        </p>
      </div>
    </Card>
  );
}
