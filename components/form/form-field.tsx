"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import {
  controlClassName,
  FieldShell,
  type BaseFieldProps,
} from "@/components/form/field-shell";

type Props = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className"> & {
    type?: "text" | "email" | "tel" | "number" | "search";
  };

/** Standard single-line text input (text, email, tel, number, search). */
export function FormField({
  name,
  label,
  error,
  hint,
  required,
  disabled,
  className,
  type = "text",
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
        type={type}
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
