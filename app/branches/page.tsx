import type { Metadata } from "next";
import { BranchWorkspace } from "@/components/branches/branch-workspace";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Branches",
  description: "Look up branch addresses, open branches and maintain branch details.",
};

export default function BranchesPage() {
  return (
    <>
      <PageHeader
        title="Branches"
        description="Look up the street and city for a branch number, open a new branch, and maintain the details held in DH_BRANCH. The branch number itself can never be changed."
        backedBy="DH_BRANCH · new_branch · GET /api/branches/[branchNo]/address · PATCH /api/branches/[branchNo]"
      />
      <BranchWorkspace />
    </>
  );
}
