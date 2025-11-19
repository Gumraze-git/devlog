import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh8zlkkhlslw0zyz.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
