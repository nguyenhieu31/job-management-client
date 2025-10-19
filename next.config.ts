import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    if (process.env.NEXT_PUBLIC_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8086/api/:path*", // Proxy tới backend
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
