import type { NextConfig } from "next";

/**
 * Next.js configuration file.
 *
 * This is where you control how Next.js behaves during build and runtime.
 * Common options include:
 *   - images: configure allowed remote image hosts
 *   - redirects: URL redirects
 *   - headers: custom HTTP headers
 *   - experimental: opt-in to Next.js experimental features
 *
 * Docs: https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig: NextConfig = {
  // reactStrictMode renders components twice in development to help
  // detect side effects. Always keep this true during learning.
  reactStrictMode: true,
};

export default nextConfig;
