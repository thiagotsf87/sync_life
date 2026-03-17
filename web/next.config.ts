import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";

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
      // Coach IA promoted to top-level
      { source: '/corpo/coach', destination: '/coach', permanent: true },
    ]
  },
};

export default withSentryConfig(nextConfig, {
  // Upload source maps only when SENTRY_AUTH_TOKEN is set (CI/prod)
  silent: !process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Disable source map upload when no auth token
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
