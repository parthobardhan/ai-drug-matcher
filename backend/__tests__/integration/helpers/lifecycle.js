const {
  connectIntegrationDB,
  disconnectIntegrationDB,
  assertDatabaseSeeded,
} = require('./db');

function useIntegrationLifecycle() {
  beforeAll(async () => {
    await connectIntegrationDB();
    await assertDatabaseSeeded();
  });

  afterAll(async () => {
    await disconnectIntegrationDB();
  });
}

module.exports = { useIntegrationLifecycle };
