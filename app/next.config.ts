import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable hot reload in Docker
  experimental: {
    // Ensure proper file watching in Docker
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 300,
    },
  },
  // Ensure proper hostname binding
  env: {
    HOSTNAME: '0.0.0.0',
  },
};

export default nextConfig;
