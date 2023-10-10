const path = require(`path`);
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    plugins: [
      ...(process.env.ANALYZE === 'true'
        ? [new BundleAnalyzerPlugin({ analyzerMode: 'static' })]
        : []),
    ],
  },
};
