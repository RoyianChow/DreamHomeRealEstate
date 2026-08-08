"use client";

import { useState } from "react";
import { HireStaffForm } from "@/components/staff/hire-staff-form";
import { StaffTable } from "@/components/staff/staff-table";
import { LoadingButton } from "@/components/ui/loading-button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { TabPanels } from "@/components/ui/tab-panels";
import { useRecords } from "@/hooks/use-records";
import { branchApi, staffApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { Branch, Staff } from "@/lib/types";

/**
 * Staff area (UI-2). Hire and maintain live on one route behind two tabs, and
 * both share a single list so a successful hire refreshes the table underneath
 * before the user switches to it.
 */
export function StaffWorkspace() {
  const staff = useRecords<Staff>(staffApi.list);
  const branches = useRecords<Branch>(branchApi.list);
  const [banner, setBanner] = useState<string | null>(null);

  const branchOptions = branches.rows.map((branch) => ({
    value: branch.branchNo,
    label: `${branch.branchNo} - ${branch.city}`,
  }));

  async function afterHire(hired: Staff) {
    setBanner(
      `${hired.firstName} ${hired.lastName} was hired. The database generated staff number ${hired.staffNo}.`,
    );
    await staff.reload();
  }

  async function afterUpdate(updated: Staff) {
    setBanner(
      `Staff number ${updated.staffNo} updated. Salary is now ${formatCurrency(updated.salary)}.`,
    );
    await staff.reload();
  }

  return (
    <div className="space-y-4">
      {banner ? (
        <StatusAlert tone="success" title="Saved" onDismiss={() => setBanner(null)}>
          {banner} Refresh the page or check SQL Developer to confirm the row.
        </StatusAlert>
      ) : null}

      <TabPanels
        label="Staff actions"
        tabs={[
          {
            id: "hire",
            label: "Hire",
            summary:
              "Collects the nine inputs required by Staff_hire_sp and inserts a row into DH_STAFF.",
            content: (
              <HireStaffForm
                branchOptions={branchOptions}
                branchesUnavailable={Boolean(branches.error)}
                onHired={(hired) => void afterHire(hired)}
              />
            ),
          },
          {
            id: "list",
            label: "View & update",
            summary:
              "Every staff record, with in-place editing of the three fields the assignment allows.",
            content: (
              <SectionCard
                title="Staff records"
                description={
                  staff.isLoading
                    ? "Loading records..."
                    : `${staff.rows.length} record${staff.rows.length === 1 ? "" : "s"} in DH_STAFF.`
                }
                actions={
                  <LoadingButton
                    size="sm"
                    variant="secondary"
                    isLoading={staff.isLoading}
                    loadingLabel="Refreshing"
                    onClick={() => void staff.reload()}
                  >
                    Refresh list
                  </LoadingButton>
                }
              >
                <StaffTable
                  rows={staff.rows}
                  isLoading={staff.isLoading}
                  error={staff.error}
                  onRetry={() => void staff.reload()}
                  onSaved={(updated) => void afterUpdate(updated)}
                />
              </SectionCard>
            ),
          },
        ]}
      />
    </div>
  );
}
