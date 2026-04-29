/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Mode standalone pour Docker
  images: {
    domains: ['localhost', 'api.dicebear.com', 'ui-avatars.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
};

module.exports = nextConfig;
