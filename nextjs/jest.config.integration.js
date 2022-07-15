const nextJest = require('next/jest');
const { nextConfig, customJestConfig } = require('./jest.config');
const createJestConfig = nextJest(nextConfig);

// integration test files must have itest or ispec on the filename
// it will use the .env.test file as default
console.log('RUNNING INTEGRATION TESTS');

const config = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  globalSetup: '<rootDir>/jest.setup.integration.js',
  testMatch: ['**/?(*.)+(ispec|itest).[tj]s?(x)'],
};

module.exports = createJestConfig({ ...customJestConfig, ...config });
