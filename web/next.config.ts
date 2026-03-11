import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      // V2 → V3 route migrations
      { source: '/metas', destination: '/futuro', permanent: true },
      { source: '/metas/:path*', destination: '/futuro/:path*', permanent: true },
      { source: '/agenda', destination: '/tempo', permanent: true },
      { source: '/agenda/:path*', destination: '/tempo/:path*', permanent: true },
    ]
  },
};

export default nextConfig;
