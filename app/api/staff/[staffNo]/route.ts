import { getDataSource } from "@/lib/server/data-source";
import { fail, handleUnexpected, ok, readJson } from "@/lib/server/http";
import { staffUpdateSchema, validate } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/staff/[staffNo] - accepts salary, telephone and email only.
 *
 * The schema is the allowlist: any other key in the body is dropped before the
 * update reaches the data source, so STAFFNO can never be rewritten.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ staffNo: string }> },
) {
  try {
    const { staffNo } = await params;
    const parsed = validate(staffUpdateSchema, await readJson(request));
    if (!parsed.ok) {
      return fail("VALIDATION_ERROR", parsed.message, parsed.fieldErrors);
    }

    const dataSource = await getDataSource();
    return ok(await dataSource.updateStaff(staffNo, parsed.value));
  } catch (error) {
    return handleUnexpected(error, "PATCH /api/staff/[staffNo]");
  }
}
