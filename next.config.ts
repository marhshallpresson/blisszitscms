
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/app/dashboard',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/app/settings',
        permanent: true,
      },
       {
        source: '/admin',
        destination: '/app/admin',
        permanent: true,
      },
       {
        source: '/analytics',
        destination: '/app/analytics',
        permanent: true,
      },
      {
        source: '/inbox',
        destination: '/app/inbox',
        permanent: true,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
