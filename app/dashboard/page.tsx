import type { Metadata } from "next";
import { MenuCards } from "@/components/dashboard/menu-cards";
import { ConnectionStatus } from "@/components/layout/connection-status";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/ui/section-card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Main menu for the Staff, Branch and Client areas.",
};

const DEMO_STEPS = [
  "Dashboard: show the three menus and the database connection status.",
  "Staff: hire a new member, confirm the generated staff number, then update an allowed field.",
  "Branch: look up an address by branch number, open a branch, update an allowed field.",
  "Client: register a client, then change the preferred property type and maximum rent.",
  "Backend evidence: show the same rows in SQL Developer.",
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Main menu"
        description="Dream Home Real Estate administration. Choose an area to begin; every action is validated in the browser and again on the server before it reaches the database."
        actions={<ConnectionStatus detailed />}
      />

      <MenuCards />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="How the application is put together"
          description="Useful for the opening slide of the presentation."
        >
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                1
              </span>
              <span>
                <strong>Browser.</strong> Next.js pages and shared React components
                collect input and display results.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                2
              </span>
              <span>
                <strong>Server layer.</strong> Route handlers validate every request
                and own all database calls.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                3
              </span>
              <span>
                <strong>Oracle adapter.</strong> A server-only connection pool uses
                bind variables and controlled transactions.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                4
              </span>
              <span>
                <strong>Database.</strong> PL/SQL procedures write to DH_STAFF,
                DH_BRANCH and DH_CLIENT.
              </span>
            </li>
          </ol>

          <p className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            The browser never connects to Oracle. Credentials live only in
            <code className="mx-1 rounded bg-white px-1 py-0.5 font-mono">.env.local</code>
            on the server, which is excluded from Git.
          </p>
        </SectionCard>

        <SectionCard
          title="Demonstration order"
          description="The route the team walks through in the live demo."
        >
          <ol className="space-y-2 text-sm text-slate-700">
            {DEMO_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </>
  );
}
