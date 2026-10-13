import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second dev server or the E2E build run beside `npm run dev` without sharing a build folder.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
