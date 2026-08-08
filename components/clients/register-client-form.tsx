"use client";

import { useState } from "react";
import { CurrencyField } from "@/components/form/currency-field";
import { FormActions } from "@/components/form/form-actions";
import { FormField } from "@/components/form/form-field";
import { SelectField } from "@/components/form/select-field";
import { SectionCard } from "@/components/ui/section-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { clientApi } from "@/lib/api-client";
import { PROPERTY_TYPES } from "@/lib/constants";
import type { Client, ClientCreateInput, FieldErrors } from "@/lib/types";
import { clientCreateSchema, validate } from "@/lib/validation";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  telephone: "",
  preferredPropertyType: "",
  maxRent: "",
};

/** Registers a client in DH_CLIENT. The client number is generated server side. */
export function RegisterClientForm({
  onRegistered,
}: {
  onRegistered: (client: Client) => void;
}) {
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

    const parsed = validate(clientCreateSchema, values);
    if (!parsed.ok) {
      setErrors(parsed.fieldErrors);
      setFormError(parsed.message);
      return;
    }

    setErrors({});
    setFormError(null);
    setIsSubmitting(true);

    const result = await clientApi.create(parsed.value as ClientCreateInput);
    setIsSubmitting(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setFormError(result.message);
      return;
    }

    onRegistered(result.data);
    resetForm();
  }

  return (
    <SectionCard
      title="Register a client"
      description="Adds a row to DH_CLIENT. These are the same five fields that can be updated later; the client number is assigned by the database."
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="mb-5">
            <StatusAlert
              tone="error"
              title="The client was not registered"
              onDismiss={() => setFormError(null)}
            >
              {formError}
            </StatusAlert>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            name="firstName"
            label="First name"
            required
            autoComplete="given-name"
            value={values.firstName}
            error={errors.firstName}
            onChange={(event) => setField("firstName", event.target.value)}
          />

          <FormField
            name="lastName"
            label="Last name"
            required
            autoComplete="family-name"
            value={values.lastName}
            error={errors.lastName}
            onChange={(event) => setField("lastName", event.target.value)}
          />

          <FormField
            name="telephone"
            label="Telephone"
            type="tel"
            required
            autoComplete="tel"
            value={values.telephone}
            error={errors.telephone}
            onChange={(event) => setField("telephone", event.target.value)}
          />

          <SelectField
            name="preferredPropertyType"
            label="Preferred property type"
            required
            options={PROPERTY_TYPES}
            placeholder="Select a type"
            value={values.preferredPropertyType}
            error={errors.preferredPropertyType}
            onChange={(event) => setField("preferredPropertyType", event.target.value)}
          />

          <CurrencyField
            name="maxRent"
            label="Maximum rent"
            required
            hint="Monthly amount the client will pay"
            value={values.maxRent}
            error={errors.maxRent}
            onChange={(event) => setField("maxRent", event.target.value)}
          />
        </div>

        <FormActions
          submitLabel="Register client"
          loadingLabel="Saving client..."
          isSubmitting={isSubmitting}
          onReset={resetForm}
        />
      </form>
    </SectionCard>
  );
}
