//https://vercel.com/support/articles/can-i-redirect-from-a-subdomain-to-a-subpath

const staticCdn =
  process.env.LINEN_STATIC_CDN || 'https://static.main.linendev.com'; // default to prod

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/sitemap/:path*',
        destination: `${staticCdn}/sitemap/:path*`,
      },
      {
        source: '/d/:path*',
        destination: `/s/:path*`,
      },
      {
        source: '/ph/:path*',
        destination: 'https://app.posthog.com/:path*',
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}
