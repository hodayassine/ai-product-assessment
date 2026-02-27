import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use this folder as the workspace root (avoids "multiple lockfiles" warning when parent has a lockfile)
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
