import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "htmacgfeigx1pttr.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
