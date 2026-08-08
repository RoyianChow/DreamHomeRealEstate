import type { Metadata } from "next";
import { ClientWorkspace } from "@/components/clients/client-workspace";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Clients",
  description: "Register clients and maintain their contact and preference details.",
};

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Register a client and update their first name, last name, telephone, preferred property type and maximum rent - together or one field at a time. The client number only locates the record."
        backedBy="DH_CLIENT · POST /api/clients · PATCH /api/clients/[clientNo]"
      />
      <ClientWorkspace />
    </>
  );
}
