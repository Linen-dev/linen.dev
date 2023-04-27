/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom', './jest.setup.js'],
  transform: {
    '^.+\\.[tj]s?$': 'ts-jest',
  },
  moduleNameMapper: {
    '@linen/(.*)/(.*)': '<rootDir>/../../packages/$1/dist/$2',
    '@linen/(.*)': '<rootDir>/../../packages/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
    '@/(.*)$': '<rootDir>/src/$1',
  },
};
