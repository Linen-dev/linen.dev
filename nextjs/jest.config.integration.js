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
  setupFilesAfterEnv: ['<rootDir>/jest.setup.integration.js'],
};

module.exports = createJestConfig({ ...customJestConfig, ...config });
