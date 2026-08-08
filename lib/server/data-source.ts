/**
 * Chooses the data source for this process.
 *
 * DATA_SOURCE=mock   -> in-memory sample data (front-end development, no Oracle)
 * DATA_SOURCE=oracle -> Member 3's node-oracledb implementation
 */

import "server-only";

import { DataError, type DreamHomeDataSource } from "@/lib/server/contracts";
import { mockDataSource } from "@/lib/server/mock-data-source";

export type { DreamHomeDataSource };
export { DataError };

export async function getDataSource(): Promise<DreamHomeDataSource> {
  if (process.env.DATA_SOURCE === "oracle") {
    /*
     * Member 3 - API Integration Lead:
     *   const { oracleDataSource } = await import("@/lib/server/oracle-data-source");
     *   return oracleDataSource;
     * Delete the throw below once that module exists.
     */
    throw new DataError(
      "DATABASE_ERROR",
      "DATA_SOURCE is set to 'oracle' but the Oracle data source has not been added yet. Set DATA_SOURCE=mock in .env.local to keep working against sample data.",
    );
  }

  return mockDataSource;
}
