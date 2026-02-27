import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
