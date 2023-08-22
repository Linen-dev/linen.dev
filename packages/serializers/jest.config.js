/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
  silent: true,
  logHeapUsage: true,
  ...(process.env.CI === 'true'
    ? {
        workerIdleMemoryLimit: '512MB',
        maxWorkers: 1,
      }
    : {}),
};
