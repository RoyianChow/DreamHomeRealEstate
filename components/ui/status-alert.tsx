import type { ReactNode } from "react";

export type AlertTone = "success" | "error" | "warning" | "info";

const TONES: Record<
  AlertTone,
  { wrapper: string; icon: string; symbol: string; role: "status" | "alert" }
> = {
  success: {
    wrapper: "border-emerald-300 bg-emerald-50 text-emerald-900",
    icon: "bg-emerald-600",
    symbol: "✓",
    role: "status",
  },
  error: {
    wrapper: "border-red-300 bg-red-50 text-red-900",
    icon: "bg-red-600",
    symbol: "!",
    role: "alert",
  },
  warning: {
    wrapper: "border-amber-300 bg-amber-50 text-amber-900",
    icon: "bg-amber-500",
    symbol: "!",
    role: "status",
  },
  info: {
    wrapper: "border-sky-300 bg-sky-50 text-sky-900",
    icon: "bg-sky-600",
    symbol: "i",
    role: "status",
  },
};

type Props = {
  tone: AlertTone;
  title: string;
  children?: ReactNode;
  /** Optional inline action, e.g. a Retry button. */
  action?: ReactNode;
  onDismiss?: () => void;
};

/**
 * Single feedback component for every success and failure message in the app.
 * Errors use role="alert" so screen readers announce them immediately.
 */
export function StatusAlert({ tone, title, children, action, onDismiss }: Props) {
  const style = TONES[tone];

  return (
    <div
      role={style.role}
      aria-live={style.role === "alert" ? "assertive" : "polite"}
      className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${style.wrapper}`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${style.icon}`}
      >
        {style.symbol}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {children ? <div className="mt-1 leading-relaxed">{children}</div> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="-mt-1 -mr-1 size-7 shrink-0 rounded-md text-lg leading-none opacity-70 hover:bg-black/5 hover:opacity-100"
        >
          <span aria-hidden="true">×</span>
          <span className="sr-only">Dismiss message</span>
        </button>
      ) : null}
    </div>
  );
}
