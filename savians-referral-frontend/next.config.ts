import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use 'standalone' for Docker deployments, remove for Amplify
  // output: 'standalone',
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
