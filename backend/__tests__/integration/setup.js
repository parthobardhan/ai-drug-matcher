require('dotenv').config();

jest.setTimeout(60000);

const integrationEnabled =
  process.env.RUN_INTEGRATION_TESTS === '1' && Boolean(process.env.MONGODB_URI);

if (!integrationEnabled) {
  const reason = !process.env.MONGODB_URI
    ? 'MONGODB_URI is not set'
    : 'RUN_INTEGRATION_TESTS is not set to "1"';

  // eslint-disable-next-line no-console
  console.warn(
    `\nSkipping integration tests (${reason}).\n` +
      'To run: RUN_INTEGRATION_TESTS=1 npm run test:integration\n'
  );
}

global.__INTEGRATION_ENABLED__ = integrationEnabled;

const originalDescribe = global.describe;

global.describe = (name, fn) => {
  if (integrationEnabled) {
    originalDescribe(name, fn);
  } else {
    originalDescribe.skip(name, fn);
  }
};

global.describe.only = originalDescribe.only;
global.describe.skip = originalDescribe.skip;
