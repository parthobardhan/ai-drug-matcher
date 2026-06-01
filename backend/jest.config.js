/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/unit/**/*.test.js',
    '**/__tests__/routes/**/*.test.js',
  ],
  clearMocks: true,
  restoreMocks: true,
};
