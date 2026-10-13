import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second dev server or the E2E build run beside `npm run dev` without sharing a build folder.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Loaded from node_modules at runtime rather than bundled: native binaries and a WASM Postgres.
  serverExternalPackages: ["@node-rs/argon2", "@electric-sql/pglite"],
};

export default nextConfig;
