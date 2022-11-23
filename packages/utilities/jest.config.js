/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
};
