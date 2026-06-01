import type { NextConfig } from "next";

/** Server-side only: where the Express API listens (used for dev/proxy rewrites). */
const backendUrl =
  process.env.BACKEND_URL || process.env.API_PROXY_TARGET || "http://127.0.0.1:5001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/health", destination: `${backendUrl}/health` },
    ];
  },
};

export default nextConfig;
