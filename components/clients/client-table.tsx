"use client";

import {
  EditableDataTable,
  type Column,
  type SaveOutcome,
} from "@/components/data/editable-data-table";
import { clientApi } from "@/lib/api-client";
import { PROPERTY_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Client, ClientUpdateInput } from "@/lib/types";
import { clientUpdateSchema, validate } from "@/lib/validation";

/**
 * The five permitted fields are editable, together or one at a time. CLIENTNO
 * is display-only: it locates the record and never changes.
 */
const COLUMNS: Column<Client>[] = [
  {
    key: "clientNo",
    header: "Client no.",
    render: (row) => <span className="font-mono font-semibold">{row.clientNo}</span>,
  },
  { key: "firstName", header: "First name", editable: true },
  { key: "lastName", header: "Last name", editable: true },
  { key: "telephone", header: "Telephone", editable: true, inputType: "tel" },
  {
    key: "preferredPropertyType",
    header: "Preferred type",
    editable: true,
    inputType: "select",
    options: PROPERTY_TYPES,
  },
  {
    key: "maxRent",
    header: "Maximum rent",
    align: "right",
    editable: true,
    inputType: "currency",
    render: (row) => formatCurrency(row.maxRent),
    toInputValue: (row) => String(row.maxRent),
  },
];

type Props = {
  rows: Client[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSaved: (client: Client) => void;
};

export function ClientTable({ rows, isLoading, error, onRetry, onSaved }: Props) {
  async function handleSave(
    row: Client,
    changes: Record<string, string>,
  ): Promise<SaveOutcome> {
    const parsed = validate(clientUpdateSchema, changes);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message, fieldErrors: parsed.fieldErrors };
    }

    const result = await clientApi.update(row.clientNo, parsed.value as ClientUpdateInput);
    if (!result.ok) {
      return { ok: false, message: result.message, fieldErrors: result.fieldErrors };
    }

    onSaved(result.data);
    return { ok: true };
  }

  return (
    <EditableDataTable<Client>
      rows={rows}
      columns={COLUMNS}
      getRowKey={(row) => row.clientNo}
      keyLabel="Client number"
      caption="Client records from DH_CLIENT. Name, telephone, preferred property type and maximum rent can be edited in place."
      isLoading={isLoading}
      loadError={error}
      onRetry={onRetry}
      emptyTitle="No clients registered"
      emptyDescription="Use the Register tab to add the first client."
      editNote="Editable columns: first name, last name, telephone, preferred property type and maximum rent - change one or several. The client number is read-only."
      onSave={handleSave}
    />
  );
}
