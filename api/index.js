const { app, initializeApp } = require('../backend/server');

let appReady = null;

module.exports = async (req, res) => {
  // Health check should never require a DB connection
  if (req.url === '/api/health' || (req.url && req.url.startsWith('/api/health?'))) {
    return app(req, res);
  }

  if (!appReady) {
    appReady = initializeApp().catch((error) => {
      console.error('Vercel API initialization failed:', error.message);
      appReady = null;
      throw error;
    });
  }

  try {
    await appReady;
    return app(req, res);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'API is temporarily unavailable. Please check that MONGO_URI is configured in Vercel.',
    });
  }
};