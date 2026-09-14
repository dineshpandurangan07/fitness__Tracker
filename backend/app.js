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
app.use(
  cors({
    origin: [
      'https://fitness-tracker-oqud.vercel.app',
      /^https:\/\/.*\.vercel\.app$/,
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    api: 'fitness-tracker',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Friendly error when the database is not ready (e.g. MONGO_URI missing)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected yet. If you just deployed, check that MONGO_URI is configured and wait a few seconds.',
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