"use client";

import { useEffect, useRef } from "react";
import { LoadingButton } from "@/components/ui/loading-button";

type Props = {
  open: boolean;
  title: string;
  description: string;
  /** Optional list of "field: old -> new" lines shown before confirming. */
  details?: { label: string; value: string }[];
  confirmLabel?: string;
  cancelLabel?: string;
  isWorking?: boolean;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmation step for writes that change existing data. Escape and the
 * backdrop cancel; focus moves to the confirm button and is returned to the
 * trigger when the dialog closes.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  details,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isWorking = false,
  tone = "primary",
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isWorking) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, isWorking, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={() => !isWorking && onCancel()}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
      >
        <h2 id="confirm-title" className="text-base font-semibold text-slate-900">
          {title}
        </h2>
        <p id="confirm-description" className="mt-1 text-sm text-slate-600">
          {description}
        </p>

        {details?.length ? (
          <dl className="mt-3 space-y-1 rounded-md bg-slate-50 p-3 text-sm">
            {details.map((detail) => (
              <div key={detail.label} className="flex justify-between gap-3">
                <dt className="text-slate-500">{detail.label}</dt>
                <dd className="font-medium text-slate-900">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <LoadingButton variant="secondary" onClick={onCancel} disabled={isWorking}>
            {cancelLabel}
          </LoadingButton>
          <LoadingButton
            ref={confirmRef}
            variant={tone === "danger" ? "danger" : "primary"}
            isLoading={isWorking}
            loadingLabel="Saving..."
            onClick={onConfirm}
          >
            {confirmLabel}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
