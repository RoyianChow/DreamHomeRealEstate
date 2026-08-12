import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Dream Home Real Estate",
    template: "%s · Dream Home Real Estate",
  },
  authors: [{ name: "Royian" }],
  description:
    "Staff, branch and client administration for Dream Home Real Estate, built by Royian with Next.js over an Oracle / PL-SQL backend.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
