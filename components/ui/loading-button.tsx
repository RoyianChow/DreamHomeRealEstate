"use client";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 shadow-sm",
  secondary:
    "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:text-slate-400 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 shadow-sm",
  ghost: "text-slate-700 hover:bg-slate-100 disabled:text-slate-400",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** React 19 passes ref straight through as a prop. */
  ref?: Ref<HTMLButtonElement>;
  /** Shows the spinner, disables the button and swaps the label. */
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: Variant;
  size?: "sm" | "md";
  children: ReactNode;
};

/**
 * The only button used for any action that talks to the server. It guarantees
 * a visible pending state and blocks double submits.
 */
export function LoadingButton({
  isLoading = false,
  loadingLabel,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: Props) {
  const sizing = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed ${sizing} ${VARIANTS[variant]} ${className}`}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      <span>{isLoading ? (loadingLabel ?? "Working...") : children}</span>
    </button>
  );
}
