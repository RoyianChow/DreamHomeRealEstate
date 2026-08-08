import { getDataSource } from "@/lib/server/data-source";
import { fail, handleUnexpected, ok, readJson } from "@/lib/server/http";
import { branchUpdateSchema, validate } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/branches/[branchNo] - updates the allowed branch details.
 *
 * BRANCHNO is taken from the URL and is not part of the update schema, so the
 * primary key cannot be changed through this endpoint.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ branchNo: string }> },
) {
  try {
    const { branchNo } = await params;
    const parsed = validate(branchUpdateSchema, await readJson(request));
    if (!parsed.ok) {
      return fail("VALIDATION_ERROR", parsed.message, parsed.fieldErrors);
    }

    const dataSource = await getDataSource();
    return ok(await dataSource.updateBranch(branchNo, parsed.value));
  } catch (error) {
    return handleUnexpected(error, "PATCH /api/branches/[branchNo]");
  }
}
