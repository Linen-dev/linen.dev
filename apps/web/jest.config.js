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
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '@linen/hooks/(.*)/(.*)': '<rootDir>/hooks/$1/$2',
    '@linen/hooks/(.*)': '<rootDir>/hooks/$1',
    '@linen/ui/(.*)': '<rootDir>/ui/$1',
    '@linen/(.*)/(.*)': '<rootDir>/../../packages/$1/dist/$2',
    '@linen/(.*)': '<rootDir>/../../packages/$1',
    '^axios$': require.resolve('axios'),
    '^uuid$': require.resolve('uuid'),
    '^jose$': require.resolve('jose'),
    '@panva/hkdf': require.resolve('@panva/hkdf'),
    '@/(.*)$': '<rootDir>/ui/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globalTeardown: '<rootDir>/jest.teardown.js',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  silent: true,
  logHeapUsage: true,
  ...(process.env.CI === 'true'
    ? {
        workerIdleMemoryLimit: '512MB',
        maxWorkers: 1,
      }
    : {
        // collectCoverage: true,
        // collectCoverageFrom: [
        //   './__mocks__/**/*',
        //   './__tests__/**/*',
        //   './bin/**/*',
        //   './components/**/*',
        //   './config/**/*',
        //   './contexts/**/*',
        //   './hooks/**/*',
        //   './mailers/**/*',
        //   './pages/**/*',
        //   './queue/**/*',
        //   './server/**/*',
        //   './services/**/*',
        //   './utilities/**/*',
        // ],
      }),
};
module.exports.customJestConfig = customJestConfig;
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
