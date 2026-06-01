const express = require('express');
const cors = require('cors');

function createApp() {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Optum Drug Matcher API is running',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/drugs', require('./routes/drugs'));
  app.use('/api/diagnostics', require('./routes/diagnostics'));

  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
