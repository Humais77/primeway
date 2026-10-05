import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   allowedDevOrigins: ['192.168.10.8'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
