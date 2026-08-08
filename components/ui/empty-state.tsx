import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action?: ReactNode;
};

/** Shown when a query succeeds but returns no rows - never confused with an error. */
export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-lg text-slate-500"
      >
        ∅
      </span>
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="max-w-sm text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
