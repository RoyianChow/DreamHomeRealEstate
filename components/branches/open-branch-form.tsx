"use client";

import { useState } from "react";
import { FormActions } from "@/components/form/form-actions";
import { FormField } from "@/components/form/form-field";
import { SectionCard } from "@/components/ui/section-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { branchApi } from "@/lib/api-client";
import type { Branch, FieldErrors } from "@/lib/types";
import { branchCreateSchema, validate } from "@/lib/validation";

const EMPTY_FORM = { branchNo: "", street: "", city: "", postcode: "" };

/** Opens a branch through new_branch, which inserts into DH_BRANCH. */
export function OpenBranchForm({ onOpened }: { onOpened: (branch: Branch) => void }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField(field: keyof typeof EMPTY_FORM, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function resetForm() {
    setValues(EMPTY_FORM);
    setErrors({});
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = validate(branchCreateSchema, values);
    if (!parsed.ok) {
      setErrors(parsed.fieldErrors);
      setFormError(parsed.message);
      return;
    }

    setErrors({});
    setFormError(null);
    setIsSubmitting(true);

    const result = await branchApi.create(parsed.value);
    setIsSubmitting(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setFormError(result.message);
      return;
    }

    onOpened(result.data);
    resetForm();
  }

  return (
    <SectionCard
      title="Open a new branch"
      description="Inserts a row into DH_BRANCH through new_branch. The branch number becomes the primary key and cannot be changed later."
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="mb-5">
            <StatusAlert
              tone="error"
              title="The branch was not opened"
              onDismiss={() => setFormError(null)}
            >
              {formError}
            </StatusAlert>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="branchNo"
            label="Branch number"
            required
            hint="Permanent identifier, for example B009"
            autoComplete="off"
            value={values.branchNo}
            error={errors.branchNo}
            onChange={(event) => setField("branchNo", event.target.value)}
          />

          <FormField
            name="street"
            label="Street"
            required
            autoComplete="address-line1"
            value={values.street}
            error={errors.street}
            onChange={(event) => setField("street", event.target.value)}
          />

          <FormField
            name="city"
            label="City"
            required
            autoComplete="address-level2"
            value={values.city}
            error={errors.city}
            onChange={(event) => setField("city", event.target.value)}
          />

          <FormField
            name="postcode"
            label="Postcode"
            required
            autoComplete="postal-code"
            value={values.postcode}
            error={errors.postcode}
            onChange={(event) => setField("postcode", event.target.value)}
          />
        </div>

        <FormActions
          submitLabel="Open branch"
          loadingLabel="Calling new_branch..."
          isSubmitting={isSubmitting}
          onReset={resetForm}
        />
      </form>
    </SectionCard>
  );
}
