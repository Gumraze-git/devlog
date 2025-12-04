import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "htmacgfeigx1pttr.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "velog.velcdn.com",
      },
      {
        protocol: "https",
        hostname: "images.velog.io",
      },
    ],
  },
};

export default nextConfig;
