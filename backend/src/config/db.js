const mongoose = require('mongoose');

function getDbState() {
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  return stateMap[mongoose.connection.readyState] || 'unknown';
}

async function connectDB(uri) {
  const MONGODB_URI = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/habitmind';
  mongoose.set('strictQuery', true);

  let retries = 0;
  async function attempt() {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('[db] connected:', MONGODB_URI);
    } catch (err) {
      retries += 1;
      const delay = Math.min(30000, 1000 * 2 ** retries);
      console.error('[db] connection error:', err.message, `→ retry in ${Math.round(delay / 1000)}s`);
      setTimeout(attempt, delay);
    }
  }

  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'));
  mongoose.connection.on('reconnected', () => console.log('[db] reconnected'));

  await attempt();
}

module.exports = { connectDB, getDbState };
