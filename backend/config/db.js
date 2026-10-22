const mongoose = require('mongoose');

// Configure Mongoose query buffering and timeout
mongoose.set('bufferTimeoutMS', 15000);

let mongod = null;
let reconnectTimer = null;

global.isPersistentStorage = false;
global.storageType = 'uninitialized';
global.lastDbError = null;
global.dbConnected = false;

// Setup event listeners for connection monitoring
mongoose.connection.on('connected', () => {
  global.dbConnected = true;
  global.lastDbError = null;
  console.log(`[MongoDB] Active connection established with host: ${mongoose.connection.host}`);
});

mongoose.connection.on('disconnected', () => {
  global.dbConnected = false;
  console.warn('[MongoDB] Connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  global.dbConnected = false;
  global.lastDbError = err.message;
  console.error('[MongoDB] Connection error event:', err.message);
});

/**
 * Connect to Persistent MongoDB Database
 */
const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

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
    if (isProduction) {
      const errMsg = 'CRITICAL: Persistent MONGODB_URI is missing or unconfigured in production! Data cannot be saved permanently without MongoDB Atlas.';
      console.error(`[MongoDB] ${errMsg}`);
      global.isPersistentStorage = false;
      global.storageType = 'unconfigured';
      global.lastDbError = errMsg;
      scheduleCloudReconnect();
      return null;
    }
    console.warn(`[MongoDB] Notice: External MONGODB_URI is not set. Development mode active.`);
    uri = null;
  }

  // 1. Attempt connection to external persistent database (MongoDB Atlas or external server)
  if (uri) {
    const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    try {
      console.log(`[MongoDB] Connecting to persistent database: ${safeUri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 50,
        minPoolSize: 5,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        w: 'majority'
      });

      global.dbConnected = true;
      global.isPersistentStorage = true;
      global.storageType = uri.startsWith('mongodb+srv://') ? 'MongoDB Atlas (Permanent Cloud)' : 'External MongoDB Server (Permanent)';
      global.lastDbError = null;
      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} [${global.storageType}] ✓`);
      return conn;
    } catch (err) {
      console.error(`[MongoDB] Connection to ${safeUri} failed: ${err.message}`);
      global.dbConnected = false;
      global.isPersistentStorage = false;
      global.lastDbError = err.message;

      if (isProduction) {
        console.error('[MongoDB] In production, silent in-memory fallback is DISABLED to prevent data loss.');
        console.error('[MongoDB] Retrying connection to persistent MongoDB Atlas in background...');
        scheduleCloudReconnect();
        return null;
      }

      console.warn('[MongoDB] Falling back to standalone development database for offline local testing...');
    }
  }

  // 2. Standalone Development Engine (Strictly for local testing / offline dev)
  try {
    console.log('[MongoDB] Starting standalone development database engine...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({
      binary: {
        version: '7.0.14'
      },
      instance: {
        dbName: 'smart_house_db'
      }
    });
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Standalone development database active: ${memoryUri}`);
    global.dbConnected = true;
    global.isPersistentStorage = false;
    global.storageType = 'Development Standalone (Ephemeral)';
    global.lastDbError = null;
    return conn;
  } catch (memErr) {
    global.dbConnected = false;
    global.isPersistentStorage = false;
    global.lastDbError = memErr.message;
    console.error('[MongoDB] Standalone database startup error:', memErr.message);
    return null;
  }
};

/**
 * Background auto-reconnect scheduler for persistent cloud storage
 */
const scheduleCloudReconnect = () => {
  if (reconnectTimer) return;
  console.log('[MongoDB] Scheduling persistent database reconnection attempt in 15 seconds...');
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (mongoose.connection.readyState !== 1) {
      console.log('[MongoDB] Executing scheduled database reconnection...');
      await connectDB();
    }
  }, 15000);
};

const disconnectDB = async () => {
  try {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    global.dbConnected = false;
    global.isPersistentStorage = false;
    console.log('[MongoDB] Disconnected cleanly.');
  } catch (err) {
    console.error('[MongoDB] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };