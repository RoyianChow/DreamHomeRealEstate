"use client";

import {
  EditableDataTable,
  type Column,
  type SaveOutcome,
} from "@/components/data/editable-data-table";
import { staffApi } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Staff } from "@/lib/types";
import { staffUpdateSchema, validate } from "@/lib/validation";

/**
 * Only salary, telephone and email carry `editable: true`, so the update
 * allowlist is visible in one place and the table cannot offer any other edit.
 */
const COLUMNS: Column<Staff>[] = [
  { key: "staffNo", header: "Staff no.", render: (row) => <span className="font-mono font-semibold">{row.staffNo}</span> },
  { key: "firstName", header: "First name" },
  { key: "lastName", header: "Last name" },
  { key: "position", header: "Position" },
  { key: "branchNo", header: "Branch", render: (row) => <span className="font-mono">{row.branchNo}</span> },
  { key: "dob", header: "Date of birth", render: (row) => formatDate(row.dob) },
  {
    key: "salary",
    header: "Salary",
    align: "right",
    editable: true,
    inputType: "currency",
    render: (row) => formatCurrency(row.salary),
    toInputValue: (row) => String(row.salary),
  },
  { key: "telephone", header: "Telephone", editable: true, inputType: "tel" },
  { key: "mobile", header: "Mobile" },
  { key: "email", header: "Email", editable: true, inputType: "email" },
];

type Props = {
  rows: Staff[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSaved: (staff: Staff) => void;
};

export function StaffTable({ rows, isLoading, error, onRetry, onSaved }: Props) {
  async function handleSave(
    row: Staff,
    changes: Record<string, string>,
  ): Promise<SaveOutcome> {
    const parsed = validate(staffUpdateSchema, changes);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message, fieldErrors: parsed.fieldErrors };
    }

    const result = await staffApi.update(row.staffNo, parsed.value);
    if (!result.ok) {
      return { ok: false, message: result.message, fieldErrors: result.fieldErrors };
    }

    onSaved(result.data);
    return { ok: true };
  }

  return (
    <EditableDataTable<Staff>
      rows={rows}
      columns={COLUMNS}
      getRowKey={(row) => row.staffNo}
      keyLabel="Staff number"
      caption="Staff records from DH_STAFF. Salary, telephone and email can be edited in place."
      isLoading={isLoading}
      loadError={error}
      onRetry={onRetry}
      emptyTitle="No staff records"
      emptyDescription="Use the Hire tab to add the first staff member; the new row appears here straight away."
      editNote="Editable columns: salary, telephone and email. The staff number and every other column are read-only."
      onSave={handleSave}
    />
  );
}
