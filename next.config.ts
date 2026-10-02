import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server build (with a pruned
  // node_modules) under .next/standalone - ideal for Docker deploys.
  output: "standalone",
};

export default nextConfig;
