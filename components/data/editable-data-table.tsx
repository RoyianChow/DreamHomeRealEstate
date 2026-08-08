"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingButton } from "@/components/ui/loading-button";
import { StatusAlert } from "@/components/ui/status-alert";
import { controlClassName } from "@/components/form/field-shell";
import type { Option } from "@/lib/constants";
import type { FieldErrors } from "@/lib/types";

export type ColumnInput = "text" | "tel" | "email" | "currency" | "select";

export type Column<T> = {
  /** Field name in the row object and in the PATCH payload. */
  key: string;
  header: string;
  /**
   * Editable columns are the update allowlist for the feature. Keys such as
   * STAFFNO, BRANCHNO and CLIENTNO are simply never marked editable, so the UI
   * cannot offer a change the server would have to reject.
   */
  editable?: boolean;
  inputType?: ColumnInput;
  options?: readonly Option[];
  align?: "left" | "right";
  /** Read-mode renderer. Defaults to the raw value. */
  render?: (row: T) => ReactNode;
  /** Edit-mode starting value. Defaults to String(value). */
  toInputValue?: (row: T) => string;
};

export type SaveOutcome =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string;
  /** Human name of the key column, used in confirmations and announcements. */
  keyLabel: string;
  caption: string;
  isLoading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Omit to render a read-only table. */
  onSave?: (row: T, changes: Record<string, string>) => Promise<SaveOutcome>;
  /** Note above the table explaining which columns may be changed. */
  editNote?: string;
  confirmBeforeSave?: boolean;
};

function readValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

/**
 * Table with per-row inline editing (UI-1).
 *
 * One row is editable at a time. Only columns marked `editable` render an
 * input, and only fields whose value actually changed are sent to the server,
 * which keeps the PATCH payload inside the agreed update allowlist.
 */
export function EditableDataTable<T>({
  rows,
  columns,
  getRowKey,
  keyLabel,
  caption,
  isLoading = false,
  loadError = null,
  onRetry,
  emptyTitle = "No records yet",
  emptyDescription = "Records added through this application appear here.",
  onSave,
  editNote,
  confirmBeforeSave = true,
}: Props<T>) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [initial, setInitial] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<FieldErrors>({});
  const [rowMessage, setRowMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  const editableColumns = columns.filter((column) => column.editable);
  const canEdit = Boolean(onSave) && editableColumns.length > 0;

  function startEdit(row: T) {
    const values: Record<string, string> = {};
    for (const column of editableColumns) {
      values[column.key] =
        column.toInputValue?.(row) ?? String(readValue(row, column.key) ?? "");
    }
    setEditingKey(getRowKey(row));
    setDraft(values);
    setInitial(values);
    setRowErrors({});
    setRowMessage(null);
  }

  function cancelEdit() {
    setEditingKey(null);
    setDraft({});
    setInitial({});
    setRowErrors({});
    setRowMessage(null);
  }

  function changedFields(): Record<string, string> {
    const changes: Record<string, string> = {};
    for (const [key, value] of Object.entries(draft)) {
      if (value.trim() !== (initial[key] ?? "").trim()) changes[key] = value.trim();
    }
    return changes;
  }

  function requestSave() {
    if (Object.keys(changedFields()).length === 0) {
      setRowMessage("Change at least one field before saving.");
      return;
    }
    setRowMessage(null);
    if (confirmBeforeSave) {
      setPendingConfirm(true);
    } else {
      void commitSave();
    }
  }

  async function commitSave() {
    const row = rows.find((candidate) => getRowKey(candidate) === editingKey);
    if (!row || !onSave) return;

    setIsSaving(true);
    const outcome = await onSave(row, changedFields());
    setIsSaving(false);
    setPendingConfirm(false);

    if (outcome.ok) {
      cancelEdit();
      return;
    }

    setRowErrors(outcome.fieldErrors ?? {});
    setRowMessage(outcome.message);
  }

  const confirmDetails = editableColumns
    .filter((column) => column.key in changedFields())
    .map((column) => ({
      label: column.header,
      value: `${initial[column.key] || "(blank)"} → ${draft[column.key]}`,
    }));

  /* ------------------------------------------------------------- states */

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading records</span>
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-11 animate-pulse rounded-md bg-slate-100" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <StatusAlert
        tone="error"
        title="Could not load the records"
        action={
          onRetry ? (
            <LoadingButton size="sm" variant="secondary" onClick={onRetry}>
              Try again
            </LoadingButton>
          ) : undefined
        }
      >
        {loadError}
      </StatusAlert>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  /* -------------------------------------------------------------- table */

  return (
    <div className="space-y-3">
      {editNote && canEdit ? (
        <p className="text-xs text-slate-500">{editNote}</p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-3 py-2.5 font-semibold text-slate-700 ${
                    column.align === "right" ? "text-right" : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {canEdit ? (
                <th scope="col" className="px-3 py-2.5 text-right font-semibold text-slate-700">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const rowKey = getRowKey(row);
              const isEditing = rowKey === editingKey;

              return (
                <tr
                  key={rowKey}
                  className={`border-b border-slate-100 last:border-b-0 ${
                    isEditing ? "bg-indigo-50/60" : "hover:bg-slate-50"
                  }`}
                >
                  {columns.map((column) => {
                    const editingThisCell = isEditing && column.editable;
                    const error = editingThisCell ? rowErrors[column.key] : undefined;

                    return (
                      <td
                        key={column.key}
                        className={`px-3 py-2 align-top text-slate-800 ${
                          column.align === "right" ? "text-right tabular" : ""
                        }`}
                      >
                        {editingThisCell ? (
                          <div className="min-w-[8rem]">
                            {column.inputType === "select" ? (
                              <select
                                aria-label={`${column.header} for ${keyLabel} ${rowKey}`}
                                aria-invalid={error ? true : undefined}
                                value={draft[column.key] ?? ""}
                                disabled={isSaving}
                                onChange={(event) =>
                                  setDraft((current) => ({
                                    ...current,
                                    [column.key]: event.target.value,
                                  }))
                                }
                                className={controlClassName(Boolean(error), "py-1.5")}
                              >
                                {(column.options ?? []).map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={
                                  column.inputType === "email"
                                    ? "email"
                                    : column.inputType === "tel"
                                      ? "tel"
                                      : "text"
                                }
                                inputMode={
                                  column.inputType === "currency" ? "decimal" : undefined
                                }
                                aria-label={`${column.header} for ${keyLabel} ${rowKey}`}
                                aria-invalid={error ? true : undefined}
                                value={draft[column.key] ?? ""}
                                disabled={isSaving}
                                onChange={(event) =>
                                  setDraft((current) => ({
                                    ...current,
                                    [column.key]: event.target.value,
                                  }))
                                }
                                className={controlClassName(Boolean(error), "py-1.5")}
                              />
                            )}
                            {error ? (
                              <p className="mt-1 text-left text-xs font-medium text-red-700">
                                {error}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          (column.render?.(row) ?? String(readValue(row, column.key) ?? "-"))
                        )}
                      </td>
                    );
                  })}

                  {canEdit ? (
                    <td className="px-3 py-2 text-right align-top whitespace-nowrap">
                      {isEditing ? (
                        <div className="inline-flex gap-2">
                          <LoadingButton
                            size="sm"
                            variant="secondary"
                            onClick={cancelEdit}
                            disabled={isSaving}
                          >
                            Cancel
                          </LoadingButton>
                          <LoadingButton
                            size="sm"
                            isLoading={isSaving}
                            loadingLabel="Saving"
                            onClick={requestSave}
                          >
                            Save
                          </LoadingButton>
                        </div>
                      ) : (
                        <LoadingButton
                          size="sm"
                          variant="secondary"
                          onClick={() => startEdit(row)}
                          disabled={editingKey !== null}
                        >
                          Edit
                          <span className="sr-only">
                            {" "}
                            {keyLabel} {rowKey}
                          </span>
                        </LoadingButton>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rowMessage ? (
        <StatusAlert tone="error" title="The change was not saved">
          {rowMessage}
        </StatusAlert>
      ) : null}

      <ConfirmDialog
        open={pendingConfirm}
        title="Save these changes?"
        description={`${keyLabel} ${editingKey ?? ""} will be updated in the database.`}
        details={confirmDetails}
        confirmLabel="Save changes"
        isWorking={isSaving}
        onConfirm={() => void commitSave()}
        onCancel={() => setPendingConfirm(false)}
      />
    </div>
  );
}
