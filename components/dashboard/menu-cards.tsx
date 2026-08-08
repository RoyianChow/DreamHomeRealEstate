"use client";

import Link from "next/link";
import { useRecords } from "@/hooks/use-records";
import { branchApi, clientApi, staffApi } from "@/lib/api-client";

type CardSpec = {
  href: string;
  title: string;
  description: string;
  initial: string;
  accent: string;
  actions: string[];
};

const CARDS: CardSpec[] = [
  {
    href: "/staff",
    title: "Staff",
    description:
      "Hire a staff member through Staff_hire_sp, then maintain salary, telephone and email.",
    initial: "S",
    accent: "bg-indigo-600",
    actions: ["Hire staff", "View staff", "Update allowed fields"],
  },
  {
    href: "/branches",
    title: "Branch",
    description:
      "Look up a branch address by number, open a new branch and maintain branch details.",
    initial: "B",
    accent: "bg-emerald-600",
    actions: ["Address lookup", "Open branch", "Update branch"],
  },
  {
    href: "/clients",
    title: "Client",
    description:
      "Register a client and update their name, telephone, preferred property type and maximum rent.",
    initial: "C",
    accent: "bg-amber-600",
    actions: ["Register client", "View clients", "Update client"],
  },
];

/**
 * The three required menus. Each card also shows a live record count, which is
 * the quickest proof during the demo that the page really reached the data.
 */
export function MenuCards() {
  const staff = useRecords(staffApi.list);
  const branches = useRecords(branchApi.list);
  const clients = useRecords(clientApi.list);

  const state = [staff, branches, clients];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map((card, index) => {
        const source = state[index];
        return (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                aria-hidden="true"
                className={`flex size-10 items-center justify-center rounded-lg text-lg font-bold text-white ${card.accent}`}
              >
                {card.initial}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 tabular">
                {source.isLoading
                  ? "Loading..."
                  : source.error
                    ? "Unavailable"
                    : `${source.rows.length} record${source.rows.length === 1 ? "" : "s"}`}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
              {card.title}
            </h2>
            <p className="mt-1 flex-1 text-sm text-slate-600">{card.description}</p>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {card.actions.map((action) => (
                <li
                  key={action}
                  className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                >
                  {action}
                </li>
              ))}
            </ul>

            <span className="mt-4 text-sm font-semibold text-indigo-700">
              Open {card.title.toLowerCase()} menu →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
