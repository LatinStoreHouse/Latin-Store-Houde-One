
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
   experimental: {
    allowedDevOrigins: [
        "https://6000-firebase-one-by-latin-8-1757338175733.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev",
    ]
  }
};

export default nextConfig;
