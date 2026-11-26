import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@aurora/shared'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
