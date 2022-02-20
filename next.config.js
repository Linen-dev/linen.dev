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
              value: 'papercups-io.linen.dev',
            },
          ],
          destination: '/community/papercups-io/:path*',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'papercups-io.localhost:3000',
            },
          ],
          destination: '/community/papercups-io/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
