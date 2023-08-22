/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  silent: true,
  logHeapUsage: true,
  ...(process.env.CI === 'true'
    ? {
        workerIdleMemoryLimit: '512MB',
        maxWorkers: 1,
      }
    : {}),
};
