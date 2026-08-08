"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", description: "Main menu and system status" },
  { href: "/staff", label: "Staff", description: "Hire and maintain staff records" },
  { href: "/branches", label: "Branches", description: "Look up and maintain branches" },
  { href: "/clients", label: "Clients", description: "Register and maintain clients" },
] as const;

/**
 * The three required menus plus the dashboard. Horizontally scrollable on
 * narrow screens rather than hidden behind a hamburger, so every menu stays
 * one tap away during the demo.
 */
export function MainNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main menu" className="-mx-1 overflow-x-auto">
      <ul className="flex items-center gap-1 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
