import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  basePath: "/calcpro",
  assetPrefix: "/calcpro/",

  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
