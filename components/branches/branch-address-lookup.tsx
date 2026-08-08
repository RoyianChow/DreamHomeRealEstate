"use client";

import { useState } from "react";
import { FormField } from "@/components/form/form-field";
import { LoadingButton } from "@/components/ui/loading-button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { branchApi } from "@/lib/api-client";
import { formatAddress } from "@/lib/format";
import type { BranchAddress } from "@/lib/types";
import { branchNoSchema, validate } from "@/lib/validation";

type Result =
  | { state: "idle" }
  | { state: "found"; address: BranchAddress }
  | { state: "missing"; message: string };

/**
 * The required lookup: enter a branch number, read street and city back from
 * DH_BRANCH. Unknown and blank branch numbers each get their own message.
 */
export function BranchAddressLookup({ knownBranchNumbers }: { knownBranchNumbers: string[] }) {
  const [branchNo, setBranchNo] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<Result>({ state: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = validate(branchNoSchema, branchNo);
    if (!parsed.ok) {
      setFieldError(parsed.fieldErrors.branchNo ?? parsed.message);
      setResult({ state: "idle" });
      return;
    }

    setFieldError(undefined);
    setIsSearching(true);
    const response = await branchApi.address(parsed.value);
    setIsSearching(false);

    if (response.ok) {
      setResult({ state: "found", address: response.data });
    } else {
      setResult({ state: "missing", message: response.message });
    }
  }

  return (
    <SectionCard
      title="Find a branch address"
      description="Enter a branch number to return the street and city held for that branch."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <FormField
          name="branchNo"
          label="Branch number"
          required
          className="sm:w-64"
          placeholder="B003"
          autoComplete="off"
          hint={
            knownBranchNumbers.length
              ? `On file: ${knownBranchNumbers.join(", ")}`
              : "For example B003"
          }
          value={branchNo}
          error={fieldError}
          onChange={(event) => {
            setBranchNo(event.target.value);
            setFieldError(undefined);
          }}
        />

        <div className="sm:mt-7">
          <LoadingButton type="submit" isLoading={isSearching} loadingLabel="Searching...">
            Look up address
          </LoadingButton>
        </div>
      </form>

      <div className="mt-5">
        {result.state === "found" ? (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
              Branch {result.address.branchNo}
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-950">
              {formatAddress(result.address.street, result.address.city)}
            </p>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-emerald-700">Street</dt>
                <dd className="font-medium text-emerald-950">{result.address.street}</dd>
              </div>
              <div>
                <dt className="text-emerald-700">City</dt>
                <dd className="font-medium text-emerald-950">{result.address.city}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {result.state === "missing" ? (
          <StatusAlert tone="error" title="No address returned">
            {result.message}
          </StatusAlert>
        ) : null}

        {result.state === "idle" ? (
          <p className="text-sm text-slate-500">
            The result appears here. Try a branch number that does not exist to see
            the error path.
          </p>
        ) : null}
      </div>
    </SectionCard>
  );
}
