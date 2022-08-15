const nextJest = require('next/jest');
const { nextConfig, customJestConfig } = require('./jest.config');
const createJestConfig = nextJest(nextConfig);

// integration test files must have itest or ispec on the filename
// it will use the .env.test file as default

const config = {
  // collectCoverage: true,
  // coverageDirectory: 'coverage',
  testMatch: ['**/?(*.)+(iispec|iitest).[tj]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/mocks.ts', '<rootDir>/__mocks__/client.ts'],
};

module.exports = createJestConfig({ ...customJestConfig, ...config });
