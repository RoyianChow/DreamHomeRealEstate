"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import {
  controlClassName,
  FieldShell,
  type BaseFieldProps,
} from "@/components/form/field-shell";
import { CURRENCY, LOCALE } from "@/lib/format";

const SYMBOL =
  new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? "$";

type Props = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className" | "type">;

/**
 * Money input for salary and maximum rent. Kept as a text input with a numeric
 * keypad hint so grouping characters typed by the user do not break the field;
 * the shared schema strips them before the value is sent.
 */
export function CurrencyField({
  name,
  label,
  error,
  hint,
  required,
  disabled,
  className,
  ...inputProps
}: Props) {
  const fieldId = useId();
  const describedBy = `${fieldId}-desc`;

  return (
    <FieldShell
      fieldId={fieldId}
      describedBy={describedBy}
      name={name}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500"
        >
          {SYMBOL}
        </span>
        <input
          {...inputProps}
          id={fieldId}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${describedBy}-error` : hint ? `${describedBy}-hint` : undefined
          }
          className={controlClassName(Boolean(error), "tabular pl-7")}
        />
      </div>
    </FieldShell>
  );
}
