import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/calcpro",
  assetPrefix: "/calcpro/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
