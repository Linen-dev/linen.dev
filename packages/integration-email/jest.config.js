/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  silent: true,
  logHeapUsage: true,
  ...(process.env.CI === 'true'
    ? {
        workerIdleMemoryLimit: '512MB',
        maxWorkers: 1,
      }
    : {}),
};
