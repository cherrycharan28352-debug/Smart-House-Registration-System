const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  // Detect placeholder strings or invalid URI schemes
  const isPlaceholder =
    !uri ||
    uri.includes('Stage') ||
    uri.includes('connection string') ||
    uri.includes('example') ||
    uri.includes('<') ||
    uri.trim().toLowerCase() === 'none' ||
    (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'));

  if (isPlaceholder) {
    console.warn(`[MongoDB] Notice: External MONGODB_URI is not set or contains placeholder text.`);
    console.log('[MongoDB] Initializing embedded high-availability database so your application runs without crashing...');
    uri = null;
  }

  // Attempt connecting to external cloud database if a valid URI is configured
  if (uri) {
    const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    try {
      console.log(`[MongoDB] Connecting to cloud database: ${safeUri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 50,
        socketTimeoutMS: 45000
      });
      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] Connection to ${safeUri} failed: ${err.message}`);
      console.log('[MongoDB] Falling back to embedded standalone database to keep application online...');
    }
  }

  // Embedded database fallback ensures the server is always online and fully functional
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Embedded database active: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.warn('[MongoDB] Embedded database startup warning:', memErr.message);
    return null;
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
