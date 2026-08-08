import { getDataSource } from "@/lib/server/data-source";
import { fail, handleUnexpected, ok } from "@/lib/server/http";
import { branchNoSchema, validate } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/branches/[branchNo]/address - the required lookup.
 *
 * Takes a branch number, queries DH_BRANCH, and returns street plus city.
 * An unknown branch number is a 404 with a clear message, not an empty 200.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ branchNo: string }> },
) {
  try {
    const { branchNo } = await params;
    const parsed = validate(branchNoSchema, branchNo);
    if (!parsed.ok) {
      return fail("VALIDATION_ERROR", parsed.message, { branchNo: parsed.message });
    }

    const dataSource = await getDataSource();
    return ok(await dataSource.getBranchAddress(parsed.value));
  } catch (error) {
    return handleUnexpected(error, "GET /api/branches/[branchNo]/address");
  }
}
