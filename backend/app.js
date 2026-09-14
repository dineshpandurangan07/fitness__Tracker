const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { seedExercises } = require('./utils/seedExercises');
const { seedDemoUserData } = require('./utils/seedDemoData');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const weightRoutes = require('./routes/weightRoutes');
const goalRoutes = require('./routes/goalRoutes');
const calorieRoutes = require('./routes/calorieRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// CORS - production frontend + localhost development
const allowedOrigins = [
  'https://fitness-tracker-oqud.vercel.app',
  'https://strong-churros-728ed1.netlify.app',
  'https://dineshpandurangan07.github.io',
];
const allowedOriginPatterns = [
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+\.netlify\.app$/i,
  /^https:\/\/[a-z0-9-]+\.github\.io$/i,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  return allowedOriginPatterns.some((pattern) => pattern.test(origin));
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, Postman, server-to-server) that omit Origin
      if (!origin) return callback(null, true);
      callback(null, isOriginAllowed(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint. `env` only reports the presence of each variable
// (never its value) so we can diagnose deployment problems instantly.
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    api: 'fitness-tracker',
    db: dbConnected ? 'connected' : 'disconnected',
    env: {
      mongoUri: Boolean(process.env.MONGO_URI),
      jwtSecret: Boolean(process.env.JWT_SECRET),
      nodeEnv: process.env.NODE_ENV || 'not-set',
      allowMemoryDb: process.env.ALLOW_MEMORY_DB === 'true',
    },
    lastDbError: dbConnected ? null : (connectDB.lastError || null),
    timestamp: new Date().toISOString(),
  });
});

// Friendly error when the database is not ready (e.g. MONGO_URI missing)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    const missing = !process.env.MONGO_URI;
    return res.status(503).json({
      success: false,
      error: 'db_not_connected',
      message: missing
        ? 'Database is not connected: the MONGO_URI environment variable is not configured. Add MONGO_URI (and JWT_SECRET) in your hosting environment under Settings -> Environment variables, then redeploy.'
        : 'Database is not connected yet. MONGO_URI is set but the connection is still establishing or failed. Check the MongoDB Atlas connection string and that network access allows this host, then wait a few seconds and retry.',
    });
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/stats', statsRoutes);

// Static frontend serving for single unified website URL (local standalone)
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'API route not found.' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware for API routes
app.use(notFound);
app.use(errorHandler);

let dbInitPromise = null;

// Initialize database once and cache the promise so warm serverless
// invocations reuse the existing connection instead of reconnecting.
const initializeApp = async () => {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await connectDB();
      await seedExercises();
      await seedDemoUserData();
    })();
  }
  return dbInitPromise;
};

module.exports = { app, initializeApp };