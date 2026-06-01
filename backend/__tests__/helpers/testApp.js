const express = require('express');
const drugsRouter = require('../../routes/drugs');
const diagnosticsRouter = require('../../routes/diagnostics');

function createDrugsApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/drugs', drugsRouter);
  return app;
}

function createDiagnosticsApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/diagnostics', diagnosticsRouter);
  return app;
}

module.exports = { createDrugsApp, createDiagnosticsApp };
