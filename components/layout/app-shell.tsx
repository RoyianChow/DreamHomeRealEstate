import Link from "next/link";
import type { ReactNode } from "react";
import { ConnectionStatus } from "@/components/layout/connection-status";
import { MainNavigation } from "@/components/layout/main-navigation";

/**
 * Application frame: skip link, branded header, the main menu, the database
 * status badge and the footer. Every page renders inside it, so navigation and
 * connection feedback are identical everywhere.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
              >
                DH
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">
                  Dream Home Real Estate
                </span>
                <span className="block text-xs text-slate-500">
                  Staff · Branch · Client administration
                </span>
              </span>
            </Link>

            <div className="lg:hidden">
              <ConnectionStatus />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <MainNavigation />
            <div className="hidden lg:block">
              <ConnectionStatus />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 sm:px-6">
          Dream Home Real Estate · Next.js front end over an Oracle / PL-SQL
          backend · Coursework demonstration build · Prepared by Royian
        </div>
      </footer>
    </div>
  );
}
