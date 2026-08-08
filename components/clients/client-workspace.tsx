"use client";

import { useState } from "react";
import { ClientTable } from "@/components/clients/client-table";
import { RegisterClientForm } from "@/components/clients/register-client-form";
import { LoadingButton } from "@/components/ui/loading-button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { TabPanels } from "@/components/ui/tab-panels";
import { useRecords } from "@/hooks/use-records";
import { clientApi } from "@/lib/api-client";
import { formatCurrency, fullName } from "@/lib/format";
import type { Client } from "@/lib/types";

/** Client area (UI-4): register a client and maintain the permitted fields. */
export function ClientWorkspace() {
  const clients = useRecords<Client>(clientApi.list);
  const [banner, setBanner] = useState<string | null>(null);

  async function afterRegister(client: Client) {
    setBanner(
      `${fullName(client.firstName, client.lastName)} was registered as client ${client.clientNo}.`,
    );
    await clients.reload();
  }

  async function afterUpdate(client: Client) {
    setBanner(
      `Client ${client.clientNo} updated: ${client.preferredPropertyType}, up to ${formatCurrency(client.maxRent)}.`,
    );
    await clients.reload();
  }

  return (
    <div className="space-y-4">
      {banner ? (
        <StatusAlert tone="success" title="Saved" onDismiss={() => setBanner(null)}>
          {banner} The client number was not changed.
        </StatusAlert>
      ) : null}

      <TabPanels
        label="Client actions"
        tabs={[
          {
            id: "register",
            label: "Register",
            summary: "Adds a new client to DH_CLIENT with a generated client number.",
            content: (
              <RegisterClientForm onRegistered={(client) => void afterRegister(client)} />
            ),
          },
          {
            id: "list",
            label: "View & update",
            summary:
              "All clients, with in-place editing of the five fields the assignment permits.",
            content: (
              <SectionCard
                title="Client records"
                description={
                  clients.isLoading
                    ? "Loading records..."
                    : `${clients.rows.length} record${clients.rows.length === 1 ? "" : "s"} in DH_CLIENT.`
                }
                actions={
                  <LoadingButton
                    size="sm"
                    variant="secondary"
                    isLoading={clients.isLoading}
                    loadingLabel="Refreshing"
                    onClick={() => void clients.reload()}
                  >
                    Refresh list
                  </LoadingButton>
                }
              >
                <ClientTable
                  rows={clients.rows}
                  isLoading={clients.isLoading}
                  error={clients.error}
                  onRetry={() => void clients.reload()}
                  onSaved={(client) => void afterUpdate(client)}
                />
              </SectionCard>
            ),
          },
        ]}
      />
    </div>
  );
}
