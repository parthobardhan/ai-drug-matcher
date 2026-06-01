require('dotenv').config();

const connectDB = require('./config/database');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 API Base: http://localhost:${PORT}/api/drugs\n`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { createApp, start };
