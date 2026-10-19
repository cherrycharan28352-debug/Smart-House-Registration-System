const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const mongoose = require('mongoose');
const { seedInitialData } = require('./utils/seedData');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const houseRoutes = require('./routes/houseRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const familyRoutes = require('./routes/familyRoutes');
const photoRoutes = require('./routes/photoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const exportRoutes = require('./routes/exportRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const beatRoutes = require('./routes/beatRoutes');
const villageRoutes = require('./routes/villageRoutes');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration for production and local environments
const rawAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.APP_BASE_URL,
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : [])
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Allow configured domains, localhost, and Vercel/Render preview deployments
      if (
        rawAllowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Apply rate limiter to general API routes
app.use('/api', apiLimiter);

// Root health check endpoint for cloud load balancers
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Mane Manege Police Backend API',
    kannadaTitle: 'ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: isDbReady ? 'healthy' : 'initializing',
    database: {
      connected: isDbReady,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || null,
      error: global.lastDbError || null
    },
    system: 'Smart House Registration and Family Management API',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/houses', exportRoutes); // Export routes mounted before standard /:id to prevent param collision
app.use('/api/houses', houseRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/beats', beatRoutes);
app.use('/api/villages', villageRoutes);

// Protected uploads folder for photos (with photoController streaming fallback)
const uploadsDirectory = path.join(__dirname, 'uploads', 'houses');
app.use('/uploads/houses', express.static(uploadsDirectory));

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Bind to port immediately so cloud providers (Render, Railway, etc.) detect the service as LIVE instantly
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`Smart House Registration Backend API is running!`);
  console.log(`PORT: ${PORT} (Bound to 0.0.0.0 for cloud health checks)`);
  console.log(`Health Check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

// Initialize Database & seed data in background without blocking port binding
(async () => {
  try {
    const conn = await connectDB();
    if (conn) {
      await seedInitialData();
      console.log('[Startup] Background initialization and database seeding completed successfully.');
    }
  } catch (err) {
    console.error('[Startup] Database initialization warning:', err.message);
  }
})();

module.exports = app;
