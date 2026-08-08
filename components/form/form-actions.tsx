"use client";

import { LoadingButton } from "@/components/ui/loading-button";

type Props = {
  submitLabel: string;
  loadingLabel?: string;
  isSubmitting: boolean;
  onReset?: () => void;
  resetLabel?: string;
  /** Optional note shown on the left, e.g. "* required field". */
  note?: string;
};

/** Consistent submit / reset row for every form in the app. */
export function FormActions({
  submitLabel,
  loadingLabel,
  isSubmitting,
  onReset,
  resetLabel = "Clear form",
  note = "* required field",
}: Props) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      {note ? <p className="text-xs text-slate-500">{note}</p> : <span />}

      <div className="flex gap-2 sm:justify-end">
        {onReset ? (
          <LoadingButton
            type="button"
            variant="secondary"
            onClick={onReset}
            disabled={isSubmitting}
          >
            {resetLabel}
          </LoadingButton>
        ) : null}

        <LoadingButton type="submit" isLoading={isSubmitting} loadingLabel={loadingLabel}>
          {submitLabel}
        </LoadingButton>
      </div>
    </div>
  );
}
