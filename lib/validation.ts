/**
 * Shared validation schemas (deliverable P0-3).
 *
 * The same schemas run in the browser (fast feedback) and in the route
 * handlers (final authority). Nothing reaches Oracle without passing here.
 */

import { z } from "zod";
import { PROPERTY_TYPES, RULES } from "@/lib/constants";
import type { FieldErrors } from "@/lib/types";

/* --------------------------------------------------------- field builders */

const trimmed = z.string().trim();

const name = (label: string) =>
  trimmed
    .min(1, `${label} is required`)
    .max(50, `${label} must be 50 characters or fewer`)
    .regex(
      /^[A-Za-z][A-Za-z .'-]*$/,
      `${label} may contain letters, spaces, apostrophes and hyphens only`,
    );

const telephone = (label: string) =>
  trimmed
    .min(1, `${label} is required`)
    .min(7, `${label} must be at least 7 characters`)
    .max(20, `${label} must be 20 characters or fewer`)
    .regex(/^[0-9+()\-\s]+$/, `${label} may contain digits, +, -, ( ) and spaces only`);

const email = trimmed
  .min(1, "Email is required")
  .max(100, "Email must be 100 characters or fewer")
  .pipe(z.email("Enter a valid email address"));

/** Record keys: short alphanumeric codes such as SG5 or B003. */
const recordKey = (label: string) =>
  trimmed
    .min(1, `${label} is required`)
    .min(2, `${label} must be at least 2 characters`)
    .max(8, `${label} must be 8 characters or fewer`)
    .regex(/^[A-Za-z0-9]+$/, `${label} may contain letters and digits only`)
    .transform((value) => value.toUpperCase());

/** Accepts "45000", "45,000" or "£45,000" from a text input. */
const money = (label: string, min: number, max: number) =>
  z
    .union([z.number(), trimmed])
    .transform((value) =>
      typeof value === "number" ? value : value.replace(/[^0-9.-]/g, ""),
    )
    .refine((value) => value !== "", `${label} is required`)
    .transform((value) => (typeof value === "number" ? value : Number(value)))
    .refine((value) => Number.isFinite(value), `${label} must be a number`)
    .refine((value) => value >= min, `${label} cannot be less than ${min}`)
    .refine((value) => value <= max, `${label} cannot be more than ${max}`);

const dateOfBirth = trimmed
  .min(1, "Date of birth is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker (yyyy-mm-dd)")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a real date")
  .refine((value) => {
    const age = ageOn(value);
    return age >= RULES.minHireAge;
  }, `Staff must be at least ${RULES.minHireAge} years old`)
  .refine((value) => ageOn(value) <= RULES.maxHireAge, "Check the date of birth");

function ageOn(isoDate: string, today = new Date()): number {
  const dob = new Date(`${isoDate}T00:00:00`);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

const propertyType = z.enum(
  PROPERTY_TYPES.map((option) => option.value) as [string, ...string[]],
  { message: "Choose a preferred property type" },
);

/* ------------------------------------------------------------ staff rules */

/** The nine inputs of Staff_hire_sp. STAFFNO is generated, never submitted. */
export const staffHireSchema = z.object({
  firstName: name("First name"),
  lastName: name("Last name"),
  position: trimmed.min(1, "Position is required"),
  branchNo: recordKey("Branch number"),
  dob: dateOfBirth,
  salary: money("Salary", RULES.minSalary, RULES.maxSalary),
  telephone: telephone("Telephone"),
  mobile: telephone("Mobile"),
  email,
});

/** Allowlist: salary, telephone, email. Any subset, at least one field. */
export const staffUpdateSchema = z
  .object({
    salary: money("Salary", RULES.minSalary, RULES.maxSalary).optional(),
    telephone: telephone("Telephone").optional(),
    email: email.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Change at least one field before saving",
  });

/* ----------------------------------------------------------- branch rules */

export const branchNoSchema = recordKey("Branch number");

export const branchCreateSchema = z.object({
  branchNo: recordKey("Branch number"),
  street: trimmed.min(1, "Street is required").max(60, "Street is too long"),
  city: trimmed.min(1, "City is required").max(40, "City is too long"),
  postcode: trimmed.min(1, "Postcode is required").max(12, "Postcode is too long"),
});

/** Allowlist: everything except BRANCHNO. */
export const branchUpdateSchema = z
  .object({
    street: trimmed.min(1, "Street is required").max(60, "Street is too long").optional(),
    city: trimmed.min(1, "City is required").max(40, "City is too long").optional(),
    postcode: trimmed
      .min(1, "Postcode is required")
      .max(12, "Postcode is too long")
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Change at least one field before saving",
  });

/* ----------------------------------------------------------- client rules */

export const clientNoSchema = recordKey("Client number");

export const clientCreateSchema = z.object({
  firstName: name("First name"),
  lastName: name("Last name"),
  telephone: telephone("Telephone"),
  preferredPropertyType: propertyType,
  maxRent: money("Maximum rent", RULES.minRent, RULES.maxRent),
});

/** Allowlist: the five non-key fields, together or individually. */
export const clientUpdateSchema = z
  .object({
    firstName: name("First name").optional(),
    lastName: name("Last name").optional(),
    telephone: telephone("Telephone").optional(),
    preferredPropertyType: propertyType.optional(),
    maxRent: money("Maximum rent", RULES.minRent, RULES.maxRent).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Change at least one field before saving",
  });

/* ---------------------------------------------------------------- helpers */

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; fieldErrors: FieldErrors; message: string };

/**
 * Runs a schema and flattens Zod issues into `{ fieldName: message }` so both
 * the forms and the API error envelope can use the same shape.
 */
export function validate<S extends z.ZodType>(
  schema: S,
  input: unknown,
): ValidationResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { ok: true, value: result.data };
  }

  const fieldErrors: FieldErrors = {};
  let formMessage = "";
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (key === "") {
      formMessage ||= issue.message;
      continue;
    }
    fieldErrors[key] ??= issue.message;
  }

  return {
    ok: false,
    fieldErrors,
    message: formMessage || "Please correct the highlighted fields.",
  };
}

/**
 * Drops keys the user did not fill in, so an update sends only the fields that
 * were actually touched. Empty strings mean "not provided", not "clear it".
 */
export function omitBlank<T extends Record<string, unknown>>(input: T): Partial<T> {
  const output: Partial<T> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    output[key as keyof T] = value as T[keyof T];
  }
  return output;
}
