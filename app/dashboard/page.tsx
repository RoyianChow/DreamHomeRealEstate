import type { Metadata } from "next";
import { MenuCards } from "@/components/dashboard/menu-cards";
import { ConnectionStatus } from "@/components/layout/connection-status";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Main menu for the Staff, Branch and Client areas.",
  authors: [{ name: "Royian" }],
};



export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Main menu"
        description="Dream Home Real Estate administration. Choose an area to begin; every action is validated in the browser and again on the server before it reaches the database."
        actions={<ConnectionStatus detailed />}
      />

      <MenuCards />
    </>
  );
}
