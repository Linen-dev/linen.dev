//https://vercel.com/support/articles/can-i-redirect-from-a-subdomain-to-a-subpath

/**
 * @type {import('next').NextConfig}
 */

const { join } = require('path');

function addPackagesPathToSwcLoader(rule) {
  if (rule.oneOf) {
    rule.oneOf = rule.oneOf.map((setup) => {
      if (setup?.use?.loader === 'next-swc-loader') {
        const path = join(__dirname, '../packages/ui');
        if (!setup.include.includes(path)) {
          setup.include.push(path);
        }
      }
      return setup;
    });
  }
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'avatars.slack-edge.com',
      'cdn.discordapp.com',
      `linen-assets.s3.amazonaws.com`,
      'linen-assets.s3.us-east-1.amazonaws.com',
      `${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com`,
      `${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com`,
    ],
  },
  webpack(config) {
    config.module.rules.forEach(addPackagesPathToSwcLoader);
    return config;
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
