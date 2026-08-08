"use client";

import { useState } from "react";
import { BranchAddressLookup } from "@/components/branches/branch-address-lookup";
import { BranchTable } from "@/components/branches/branch-table";
import { OpenBranchForm } from "@/components/branches/open-branch-form";
import { LoadingButton } from "@/components/ui/loading-button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusAlert } from "@/components/ui/status-alert";
import { TabPanels } from "@/components/ui/tab-panels";
import { useRecords } from "@/hooks/use-records";
import { branchApi } from "@/lib/api-client";
import { formatAddress } from "@/lib/format";
import type { Branch } from "@/lib/types";

/** Branch area (UI-3): address lookup, open branch, and the editable list. */
export function BranchWorkspace() {
  const branches = useRecords<Branch>(branchApi.list);
  const [banner, setBanner] = useState<string | null>(null);

  async function afterOpen(branch: Branch) {
    setBanner(
      `Branch ${branch.branchNo} was opened at ${formatAddress(branch.street, branch.city)}.`,
    );
    await branches.reload();
  }

  async function afterUpdate(branch: Branch) {
    setBanner(
      `Branch ${branch.branchNo} updated. Address is now ${formatAddress(branch.street, branch.city, branch.postcode)}.`,
    );
    await branches.reload();
  }

  return (
    <div className="space-y-4">
      {banner ? (
        <StatusAlert tone="success" title="Saved" onDismiss={() => setBanner(null)}>
          {banner} The branch number was not changed.
        </StatusAlert>
      ) : null}

      <TabPanels
        label="Branch actions"
        tabs={[
          {
            id: "lookup",
            label: "Address lookup",
            summary:
              "Takes a branch number, queries DH_BRANCH and returns the street and city.",
            content: (
              <BranchAddressLookup
                knownBranchNumbers={branches.rows.map((branch) => branch.branchNo)}
              />
            ),
          },
          {
            id: "open",
            label: "Open branch",
            summary: "Adds a new branch to DH_BRANCH through new_branch.",
            content: <OpenBranchForm onOpened={(branch) => void afterOpen(branch)} />,
          },
          {
            id: "list",
            label: "View & update",
            summary:
              "All branches, with in-place editing of everything except the branch number.",
            content: (
              <SectionCard
                title="Branch records"
                description={
                  branches.isLoading
                    ? "Loading records..."
                    : `${branches.rows.length} record${branches.rows.length === 1 ? "" : "s"} in DH_BRANCH.`
                }
                actions={
                  <LoadingButton
                    size="sm"
                    variant="secondary"
                    isLoading={branches.isLoading}
                    loadingLabel="Refreshing"
                    onClick={() => void branches.reload()}
                  >
                    Refresh list
                  </LoadingButton>
                }
              >
                <BranchTable
                  rows={branches.rows}
                  isLoading={branches.isLoading}
                  error={branches.error}
                  onRetry={() => void branches.reload()}
                  onSaved={(branch) => void afterUpdate(branch)}
                />
              </SectionCard>
            ),
          },
        ]}
      />
    </div>
  );
}
