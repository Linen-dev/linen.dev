/** @type {import('next').NextConfig} */
//https://vercel.com/support/articles/can-i-redirect-from-a-subdomain-to-a-subpath

const nextConfig = {
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
