/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/integration/**/*.test.js'],
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/__tests__/integration/setup.js'],
};
