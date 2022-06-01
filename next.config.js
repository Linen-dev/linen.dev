//https://vercel.com/support/articles/can-i-redirect-from-a-subdomain-to-a-subpath
const { withSentryConfig } = require('@sentry/nextjs');

const LONG_RUNNING = process.env.LONG_RUNNING === 'true';
const pageExtensions = LONG_RUNNING
  ? ['ts', 'js']
  : ['ts', 'js', 'tsx', 'jsx', 'md', 'mdx'];
const experimental = LONG_RUNNING ? { outputStandalone: true } : {};

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
    domains: [
      'avatars.slack-edge.com',
      'cdn.discordapp.com',
      `${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com`,
      `${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com`,
    ],
  },
  pageExtensions,
  experimental,
};
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  dryRun: LONG_RUNNING,

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

module.exports = withSentryConfig(
  withMDX(nextConfig),
  sentryWebpackPluginOptions
);
