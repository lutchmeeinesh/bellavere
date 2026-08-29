import type { Metadata } from "next";
import { requireClient } from "@/lib/auth";
import { getDocumentsForClient } from "@/data/documents";
import { getPropertyById } from "@/data/properties";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DocumentsList } from "@/components/dashboard/documents/DocumentsList";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const client = await requireClient();

  // Data isolation: only this client's documents, joined with property names.
  const docs = getDocumentsForClient(client.id).map((doc) => ({
    ...doc,
    propertyName: doc.propertyId
      ? (getPropertyById(doc.propertyId)?.name ?? null)
      : null,
  }));

  return (
    <div>
      <PageHeader
        title="Documents"
        sub="Contracts, insurance and compliance for your portfolio"
      />
      <DocumentsList docs={docs} />
    </div>
  );
}
