/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.dicebear.com', 'ui-avatars.com'],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
