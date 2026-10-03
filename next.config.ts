import type { NextConfig } from "next";

const isCapacitor = process.env.IS_CAPACITOR === "true";

const nextConfig: NextConfig = {
  output: "export",
  // APK build me basePath khali rahega, GitHub Pages site par /calcpro rahega
  basePath: isCapacitor ? "" : "/calcpro",
  assetPrefix: isCapacitor ? "" : "/calcpro/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
