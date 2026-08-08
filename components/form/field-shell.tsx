import type { ReactNode } from "react";

export type BaseFieldProps = {
  name: string;
  label: string;
  /** Message from the client-side schema or from the server's fieldErrors. */
  error?: string;
  /** Static help text, e.g. the expected format. */
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  /** Grid span helper used by the form layouts. */
  className?: string;
};

/** Shared input styling so every control in the app looks and behaves alike. */
export function controlClassName(hasError: boolean, extra = ""): string {
  const base =
    "block w-full rounded-md border px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
  const state = hasError
    ? "border-red-500 bg-red-50"
    : "border-slate-300 bg-white hover:border-slate-400";
  return `${base} ${state} ${extra}`;
}

type ShellProps = BaseFieldProps & {
  fieldId: string;
  describedBy: string;
  children: ReactNode;
};

/**
 * Wraps a control with its label, hint and error text, and wires the aria
 * attributes. Every field in the app goes through here, so accessibility is
 * fixed in one place rather than repeated per form.
 */
export function FieldShell({
  fieldId,
  describedBy,
  label,
  error,
  hint,
  required,
  className = "",
  children,
}: ShellProps) {
  return (
    <div className={className}>
      <label
        htmlFor={fieldId}
        className="mb-1 block text-sm font-medium text-slate-800"
      >
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-red-600">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>

      {children}

      {hint && !error ? (
        <p id={`${describedBy}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${describedBy}-error`}
          className="mt-1 flex items-start gap-1 text-xs font-medium text-red-700"
        >
          <span aria-hidden="true">•</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
