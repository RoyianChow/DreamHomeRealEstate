import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  /** Database objects behind the page - useful evidence during the demo. */
  backedBy?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, backedBy, actions }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
        {backedBy ? (
          <p className="mt-2 inline-block rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
            {backedBy}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
