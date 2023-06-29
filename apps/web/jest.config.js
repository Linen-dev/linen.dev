// jest.config.js
const nextJest = require('next/jest');
const { join } = require('path');

const nextConfig = {
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
};
module.exports.nextConfig = nextConfig;
const createJestConfig = nextJest(nextConfig);
// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '@linen/hooks/(.*)/(.*)': '<rootDir>/../../packages/hooks/dist/$1/$2',
    '@linen/(.*)/(.*)': '<rootDir>/../../packages/$1/dist/$2',
    '@linen/(.*)': '<rootDir>/../../packages/$1',
    '^axios$': require.resolve('axios'),
    '^uuid$': require.resolve('uuid'),
    '^jose$': require.resolve('jose'),
    '@panva/hkdf': require.resolve('@panva/hkdf'),
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
};
module.exports.customJestConfig = customJestConfig;
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
