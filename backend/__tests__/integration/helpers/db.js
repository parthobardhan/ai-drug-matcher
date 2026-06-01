require('dotenv').config();

const mongoose = require('mongoose');
const Drug = require('../../../models/Drug');

async function connectIntegrationDB() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'Optum';

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required for integration tests');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  return mongoose.connect(mongoUri, {
    dbName,
  });
}

async function disconnectIntegrationDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

async function assertDatabaseSeeded() {
  const count = await Drug.countDocuments();
  if (count === 0) {
    throw new Error(
      'Integration database has no drugs. Run: npm run seed'
    );
  }
  return count;
}

module.exports = {
  connectIntegrationDB,
  disconnectIntegrationDB,
  assertDatabaseSeeded,
};
