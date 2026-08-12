import { getDataSource } from "@/lib/server/data-source";
import { ok } from "@/lib/server/http";
import type { HealthStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health - drives the connection badge in the header.
 *
 * Always answers 200 with a status object: a failed database check is a normal
 * answer to this question, not a server error.
 */
export async function GET() {
  try {
    const dataSource = await getDataSource();
    return ok(await dataSource.health());
  } catch (error) {
    const status: HealthStatus = {
      dataSource: process.env.DATA_SOURCE === "oracle" ? "oracle" : "mock",
      connected: false,
      detail:
        process.env.DATA_SOURCE === "oracle"
          ? "Oracle database could not be reached."
          : error instanceof Error
            ? error.message
            : "The data source could not be reached.",
      checkedAt: new Date().toISOString(),
    };
    return ok(status);
  }
}
