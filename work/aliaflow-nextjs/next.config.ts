import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the development compiler isolated from `next build`. A running dev server
  // and a production build otherwise overwrite each other's Webpack chunks in
  // `.next`, which can leave the runtime pointing at a missing module.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: { unoptimized: true },
};

export default nextConfig;
