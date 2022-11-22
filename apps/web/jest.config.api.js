const nextJest = require('next/jest');
const { nextConfig, customJestConfig } = require('./jest.config');
const createJestConfig = nextJest(nextConfig);

const config = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: ['<rootDir>/__tests__/api/**/*.test.*'],
};

module.exports = createJestConfig({ ...customJestConfig, ...config });
