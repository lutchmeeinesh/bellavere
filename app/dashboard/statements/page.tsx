import type { Metadata } from "next";
import { requireClient } from "@/lib/auth";
import { statementsForClient } from "@/lib/metrics";
import { company } from "@/data/company";
import { Money, ConversionNote } from "@/components/currency/Money";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { RevealItem, RevealStagger, Reveal } from "@/components/ui/Reveal";
import { StatementsTable } from "@/components/dashboard/statements/StatementsTable";

export const metadata: Metadata = { title: "Statements" };

export default async function StatementsPage() {
  const client = await requireClient();

  // Data isolation: statements are derived from this client's bookings and
  // maintenance only. All three tiles are computed from the SAME array as
  // the table, so the figures always agree.
  const statements = statementsForClient(client.id);
  const totalGross = statements.reduce((sum, s) => sum + s.gross, 0);
  const totalNet = statements.reduce((sum, s) => sum + s.net, 0);
  const averageNet =
    statements.length > 0 ? Math.round(totalNet / statements.length) : 0;

  const tiles = [
    { label: "Gross rental, last 12 months", eur: totalGross },
    { label: "Net paid out, last 12 months", eur: totalNet },
    { label: "Average monthly net", eur: averageNet },
  ];

  return (
    <div>
      <PageHeader title="Statements" sub="Monthly owner statements" />

      <RevealStagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <RevealItem key={tile.label}>
            <Card className="p-6">
              <p className="text-sm text-ink-500">{tile.label}</p>
              <p className="mt-2 font-serif text-3xl text-navy-900">
                <Money eur={tile.eur} />
              </p>
            </Card>
          </RevealItem>
        ))}
      </RevealStagger>

      <StatementsTable statements={statements} clientName={client.name} />

      <Reveal>
        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-ink-500">
          The Bellavere fee is {company.pricing.model} — no hidden fees, no
          onboarding fee, no fixed monthly charges. Expenses are the month&apos;s resolved
          maintenance work plus recurring upkeep (pool, garden and
          housekeeping) for each property. Net payouts reach your account by
          the 5th of the following month.
          {/* TODO: confirm with client — payout timing */}
        </p>
        <ConversionNote className="mt-2" />
      </Reveal>
    </div>
  );
}
