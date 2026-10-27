
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.10.8"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  experimental: {
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 25,
  },
};

export default nextConfig;
