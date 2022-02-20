/** @type {import('next').NextConfig} */
//https://vercel.com/support/articles/can-i-redirect-from-a-subdomain-to-a-subpath

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        // if the host is `papercups.linen.dev`,
        // this rewrite will be applied
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'papercups.linen.dev',
            },
          ],
          destination: '/community/papercups/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
