import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      {
        protocol: "https",
        hostname: "www.visitkorea.or.kr",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.visitkorea.or.kr",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
