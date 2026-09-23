import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-mariadb'],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;