import type { Metadata } from "next";
import { requireClient } from "@/lib/auth";
import { getPropertiesForClient } from "@/data/properties";
import { ticketsByStatus } from "@/lib/metrics";
import { MaintenanceBoard } from "@/components/dashboard/maintenance/MaintenanceBoard";

export const metadata: Metadata = { title: "Maintenance" };

export default async function MaintenancePage() {
  const client = await requireClient();

  // Data isolation: tickets and the report-an-issue property list are
  // filtered by the session client's id.
  const initial = ticketsByStatus(client.id);
  const properties = getPropertiesForClient(client.id).map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <MaintenanceBoard
      clientId={client.id}
      initial={initial}
      properties={properties}
    />
  );
}
