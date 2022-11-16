/** @type {import('next').NextConfig} */

const { addPackagesPathToSwcLoader } = require('@linen/config');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.forEach(addPackagesPathToSwcLoader);
    return config;
  },
};

module.exports = nextConfig;
