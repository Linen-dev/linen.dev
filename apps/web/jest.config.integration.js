const nextJest = require('next/jest');
const { nextConfig, customJestConfig } = require('./jest.config');
const createJestConfig = nextJest(nextConfig);

// integration test files must have itest or ispec on the filename
// it will use the .env.test file as default

const config = {
  // collectCoverage: true,
  // coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: ['**/?(*.)+(ispec|itest).[tj]s?(x)'],
  moduleNameMapper: {
    '@linen/(.*)/(.*)': '<rootDir>/../../packages/$1/dist/$2',
    '@linen/(.*)': '<rootDir>/../../packages/$1',
    '^axios$': require.resolve('axios'),
  },
};

module.exports = createJestConfig({ ...customJestConfig, ...config });
