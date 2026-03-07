import type {NextConfig} from 'next';
const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.typecheck.json',
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
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
        source: '/w/:workspaceId',
        destination: '/app/workspace/:workspaceId',
        permanent: true,
      },
      {
        source: '/w/:workspaceId/:path*',
        destination: '/app/workspace/:workspaceId/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
