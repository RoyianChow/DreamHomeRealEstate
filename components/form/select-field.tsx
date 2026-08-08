"use client";

import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import {
  controlClassName,
  FieldShell,
  type BaseFieldProps,
} from "@/components/form/field-shell";
import type { Option } from "@/lib/constants";

type Props = BaseFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "className"> & {
    options: readonly Option[];
    /** Shown as a disabled first entry so nothing is silently pre-selected. */
    placeholder?: string;
  };

/** Dropdown for constrained values (staff position, property type, branch). */
export function SelectField({
  name,
  label,
  error,
  hint,
  required,
  disabled,
  className,
  options,
  placeholder = "Select...",
  ...selectProps
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
      <select
        {...selectProps}
        id={fieldId}
        name={name}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${describedBy}-error` : hint ? `${describedBy}-hint` : undefined
        }
        className={controlClassName(Boolean(error), "pr-8")}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
