"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import {
  controlClassName,
  FieldShell,
  type BaseFieldProps,
} from "@/components/form/field-shell";

type Props = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className" | "type">;

/**
 * Native date picker. The value is always yyyy-mm-dd, which is what the API
 * contract and the Oracle DATE bind expect - no locale parsing on the way in.
 */
export function DateField({
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
      <input
        {...inputProps}
        id={fieldId}
        name={name}
        type="date"
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${describedBy}-error` : hint ? `${describedBy}-hint` : undefined
        }
        className={controlClassName(Boolean(error))}
      />
    </FieldShell>
  );
}
