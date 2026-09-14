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

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
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

// Static frontend serving for single unified website URL (local/production standalone)
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware for API routes
app.use(notFound);
app.use(errorHandler);

const initializeApp = async () => {
  await connectDB();
  await seedExercises();
  await seedDemoUserData();
  return app;
};

// The server must listen at module startup.
// Node.js runtime on Vercel imports this file to detect the HTTP server —
// gating listen() behind `require.main === module` would stop the API cold.
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Unified App & API Server running on http://localhost:${PORT}`);
  // Connect DB + seed in the background so the server never waits on startup
  initializeApp()
    .then(() => console.log('Database initialized and seeded.'))
    .catch((error) => {
      console.error(`Database initialization failed: ${error.message}`);
      console.error('API routes will return a clear 503 until MONGO_URI is configured.');
    });
});

module.exports = { app, initializeApp, server };