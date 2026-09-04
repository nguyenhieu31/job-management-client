import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "dl.dropboxusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.dropbox.com",
      },
    ],
  },
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
