/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For Cloudflare Pages deployment
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
