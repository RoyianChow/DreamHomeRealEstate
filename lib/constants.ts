/**
 * Reference values used by the forms.
 *
 * These values match the positions present in the confirmed DH_STAFF data.
 * There is no database check constraint requiring any additional position.
 */

import type { PropertyType } from "@/lib/types";

export type Option = { value: string; label: string };

export const STAFF_POSITIONS: Option[] = [
  { value: "Manager", label: "Manager" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Assistant", label: "Assistant" },
];

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "House", label: "House" },
  { value: "Flat", label: "Flat" },
];

/** Business rules the UI enforces before a request is sent. */
export const RULES = {
  minSalary: 0,
  maxSalary: 1_000_000,
  minRent: 0,
  maxRent: 100_000,
  /** Youngest permitted hire age, checked against DOB. */
  minHireAge: 16,
  maxHireAge: 100,
} as const;

/** Fields the user is allowed to edit, mirrored on the server. */
export const EDITABLE_STAFF_FIELDS = ["salary", "telephone", "email"] as const;
export const EDITABLE_BRANCH_FIELDS = ["street", "city", "postcode"] as const;
export const EDITABLE_CLIENT_FIELDS = [
  "firstName",
  "lastName",
  "telephone",
  "preferredPropertyType",
  "maxRent",
] as const;
