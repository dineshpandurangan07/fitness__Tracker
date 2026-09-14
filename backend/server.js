const { app, initializeApp } = require('./app');

// Local development / standalone server.
// The deployed runtime does NOT use this file for HTTP serving —
// Vercel runs the Express app through api/index.js instead.
const PORT = process.env.PORT || 5000;

let server;

if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Unified App & API Server running on http://localhost:${PORT}`);
  });
  initializeApp()
    .then(() => console.log('Database initialized and seeded.'))
    .catch((error) => {
      console.error(`Database initialization failed: ${error.message}`);
      console.error('API routes will return a clear 503 until MONGO_URI is configured.');
    });
} else {
  // Connected elsewhere (e.g. tests); still warm the DB in the background.
  initializeApp().catch((error) => {
    console.error(`Database initialization failed: ${error.message}`);
  });
}

module.exports = { app, initializeApp, server }; // eslint-disable-line no-undef