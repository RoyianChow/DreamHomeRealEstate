"use client";

import {
  EditableDataTable,
  type Column,
  type SaveOutcome,
} from "@/components/data/editable-data-table";
import { branchApi } from "@/lib/api-client";
import type { Branch } from "@/lib/types";
import { branchUpdateSchema, validate } from "@/lib/validation";

/** BRANCHNO is deliberately not editable - it identifies the row. */
const COLUMNS: Column<Branch>[] = [
  {
    key: "branchNo",
    header: "Branch no.",
    render: (row) => <span className="font-mono font-semibold">{row.branchNo}</span>,
  },
  { key: "street", header: "Street", editable: true },
  { key: "city", header: "City", editable: true },
  { key: "postcode", header: "Postcode", editable: true },
];

type Props = {
  rows: Branch[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSaved: (branch: Branch) => void;
};

export function BranchTable({ rows, isLoading, error, onRetry, onSaved }: Props) {
  async function handleSave(
    row: Branch,
    changes: Record<string, string>,
  ): Promise<SaveOutcome> {
    const parsed = validate(branchUpdateSchema, changes);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message, fieldErrors: parsed.fieldErrors };
    }

    // The branch number travels in the URL, never in the payload.
    const result = await branchApi.update(row.branchNo, parsed.value);
    if (!result.ok) {
      return { ok: false, message: result.message, fieldErrors: result.fieldErrors };
    }

    onSaved(result.data);
    return { ok: true };
  }

  return (
    <EditableDataTable<Branch>
      rows={rows}
      columns={COLUMNS}
      getRowKey={(row) => row.branchNo}
      keyLabel="Branch number"
      caption="Branch records from DH_BRANCH. Street, city and postcode can be edited in place."
      isLoading={isLoading}
      loadError={error}
      onRetry={onRetry}
      emptyTitle="No branches"
      emptyDescription="Use the Open branch tab to add the first branch."
      editNote="Editable columns: street, city and postcode. The branch number is the primary key and is read-only."
      onSave={handleSave}
    />
  );
}
