/** @type {import('next').NextConfig} */
//https://vercel.com/support/articles/can-i-redirect-from-a-subdomain-to-a-subpath

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.slack-edge.com'],
  },
};

module.exports = nextConfig;
