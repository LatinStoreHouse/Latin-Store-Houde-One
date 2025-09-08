

import type {NextConfig} from 'next';

// Cargar las variables de entorno del archivo .env
require('dotenv').config({ path: './.env' });

// Recoger todas las variables de entorno que deben ser públicas
const publicEnv: {[key: string]: string} = {};
for (const key in process.env) {
    if (key.startsWith('NEXT_PUBLIC_')) {
        publicEnv[key] = process.env[key]!;
    }
}


const nextConfig: NextConfig = {
  /* config options here */
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
  env: publicEnv
};

export default nextConfig;
    
