import { loadEnvFile } from "node:process";
import { resolve } from "node:path";
import type { NextConfig } from "next";

// Single source of truth: load the monorepo-root .env so this app needs no local
// env file, whether started from the repo root or from apps/web. In prod/CI the
// file is absent (env comes from the platform) — ignore that; loadEnvFile never
// overrides vars already present in the environment.
try {
  loadEnvFile(resolve(import.meta.dirname, "../../.env"));
} catch {}

const nextConfig: NextConfig = {
  transpilePackages: ["@zico/ui"],
};

export default nextConfig;
