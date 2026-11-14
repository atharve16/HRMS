import type { NextConfig } from "next";

const configuredBackendUrl =
  process.env.INTERNAL_API_URL || "https://hrms-n1xj.onrender.com";

// Keep the API prefix in one place and avoid /api/v1/api/v1 when an operator
// supplies an already-prefixed internal URL.
export function normalizeBackendUrl(value: string) {
  return value.replace(/\/+$/, "").replace(/(?:\/api\/v1)+$/, "");
}

export const proxyBackendUrl = normalizeBackendUrl(configuredBackendUrl);

const backendUrl = proxyBackendUrl;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
