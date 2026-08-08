import { getDataSource } from "@/lib/server/data-source";
import { created, fail, handleUnexpected, ok, readJson } from "@/lib/server/http";
import { branchCreateSchema, validate } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/branches - every DH_BRANCH row. */
export async function GET() {
  try {
    const dataSource = await getDataSource();
    return ok(await dataSource.listBranches());
  } catch (error) {
    return handleUnexpected(error, "GET /api/branches");
  }
}

/** POST /api/branches - opens a branch through new_branch against DH_BRANCH. */
export async function POST(request: Request) {
  try {
    const parsed = validate(branchCreateSchema, await readJson(request));
    if (!parsed.ok) {
      return fail("VALIDATION_ERROR", parsed.message, parsed.fieldErrors);
    }

    const dataSource = await getDataSource();
    return created(await dataSource.createBranch(parsed.value));
  } catch (error) {
    return handleUnexpected(error, "POST /api/branches");
  }
}
