import type { NextConfig } from "next";

// Static export for GitHub Pages: the deploy workflow sets NEXT_OUTPUT=export
// and NEXT_PUBLIC_BASE_PATH=/<repo>. Local dev/build keep default behavior.
const isExport = process.env.NEXT_OUTPUT === "export";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export" as const,
        basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
