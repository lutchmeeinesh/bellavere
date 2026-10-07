import type { Metadata } from "next";
import { requireClient } from "@/lib/auth";
import { getBookingsForClient } from "@/data/bookings";
import { getPropertyById } from "@/data/properties";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BookingsTable } from "@/components/dashboard/bookings/BookingsTable";

export const metadata: Metadata = { title: "Bookings" };

export default async function BookingsPage() {
  const client = await requireClient();

  // Data isolation: everything below is filtered by the session client's id.
  const rows = getBookingsForClient(client.id).map((b) => ({
    ...b,
    propertyName: getPropertyById(b.propertyId)?.name ?? "Property",
  }));

  return (
    <div>
      <PageHeader
        title="Bookings"
        sub={`${rows.length} booking${rows.length === 1 ? "" : "s"} across your portfolio`}
      />
      <BookingsTable rows={rows} />
    </div>
  );
}
