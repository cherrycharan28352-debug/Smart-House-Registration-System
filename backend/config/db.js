const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_house_db';
  const isProduction = process.env.NODE_ENV === 'production';

  // Sanitize URI for safe logging
  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isProduction ? 10000 : 3000,
      maxPoolSize: isProduction ? 50 : 10,
      socketTimeoutMS: 45000
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    if (isProduction) {
      console.error(`[MongoDB] CRITICAL: Production connection to ${safeUri} failed: ${err.message}`);
      console.error('[MongoDB] In production, an external persistent database is required.');
      throw err;
    }

    console.warn(`[MongoDB] Standard connection to ${safeUri} failed: ${err.message}`);
    console.log('[MongoDB] Attempting to initialize in-memory fallback for seamless local execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Running with in-memory database at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] In-memory database could not be initialized:', memErr.message);
      console.error('[MongoDB] Please ensure MongoDB is running at', safeUri);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[MongoDB] Disconnected.');
  } catch (err) {
    console.error('[MongoDB] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
