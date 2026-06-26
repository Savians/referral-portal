import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable ESLint during production builds (for deployment speed)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds (type checking done separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'savians-referral-documents.s3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
