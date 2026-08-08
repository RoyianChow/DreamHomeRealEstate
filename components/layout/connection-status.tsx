"use client";

import { useEffect, useState } from "react";
import { health } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import type { ApiResult, HealthStatus } from "@/lib/types";

type State =
  | { phase: "checking" }
  | { phase: "ready"; status: HealthStatus }
  | { phase: "failed"; message: string };

function toState(result: ApiResult<HealthStatus>): State {
  return result.ok
    ? { phase: "ready", status: result.data }
    : { phase: "failed", message: result.message };
}

/**
 * Database connection badge (part of UI-1).
 *
 * Calls GET /api/health, which reports whether the server is talking to Oracle
 * or to the mock data source. During the demo this is the first thing on
 * screen that proves the application really reached the database.
 */
export function ConnectionStatus({ detailed = false }: { detailed?: boolean }) {
  const [state, setState] = useState<State>({ phase: "checking" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await health.check();
      if (!cancelled) setState(toState(result));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /** Manual re-check from the button on the badge. */
  async function check() {
    setState({ phase: "checking" });
    setState(toState(await health.check()));
  }

  const tone =
    state.phase === "checking"
      ? { dot: "bg-slate-400", text: "text-slate-600", ring: "border-slate-300" }
      : state.phase === "ready" && state.status.connected
        ? state.status.dataSource === "oracle"
          ? { dot: "bg-emerald-500", text: "text-emerald-800", ring: "border-emerald-300" }
          : { dot: "bg-amber-500", text: "text-amber-800", ring: "border-amber-300" }
        : { dot: "bg-red-500", text: "text-red-800", ring: "border-red-300" };

  const label =
    state.phase === "checking"
      ? "Checking database..."
      : state.phase === "failed"
        ? "Database unreachable"
        : state.status.connected
          ? state.status.dataSource === "oracle"
            ? "Oracle connected"
            : "Mock data (Oracle not connected)"
          : "Database unreachable";

  return (
    <div
      className={`flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 ${tone.ring}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full ${tone.dot} ${
          state.phase === "checking" ? "animate-pulse" : ""
        }`}
      />
      <span className={`text-xs font-semibold ${tone.text}`}>{label}</span>

      {detailed && state.phase === "ready" ? (
        <span className="hidden text-xs text-slate-500 sm:inline">
          · {state.status.detail} · {formatDateTime(state.status.checkedAt)}
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => void check()}
        className="ml-1 rounded-full px-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        <span aria-hidden="true">⟳</span>
        <span className="sr-only">Re-check the database connection</span>
      </button>
    </div>
  );
}
