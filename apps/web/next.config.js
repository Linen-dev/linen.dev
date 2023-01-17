//https://vercel.com/support/articles/can-i-redirect-from-a-subdomain-to-a-subpath

/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  images: {
    domains: [
      'a.slack-edge.com',
      'avatars.slack-edge.com',
      'cdn.discordapp.com',
      'avatars.githubusercontent.com',
      `linen-assets.s3.amazonaws.com`,
      'linen-assets.s3.us-east-1.amazonaws.com',
      `${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com`,
      `${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com`,
    ],
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
