import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder; without it Next.js picks up
  // unrelated lockfiles that happen to sit higher up the user's home folder.
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  // node-oracledb is a native module: it must stay external to the bundle and
  // is only ever imported from server code (Member 3's data source).
  serverExternalPackages: ["oracledb"],
};

export default nextConfig;
