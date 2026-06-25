import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "2gb",
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
