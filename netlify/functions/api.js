// Netlify Function that serves the FitPulse Express API.
//
// Wraps the same Express app used for local development (backend/app.js) with
// serverless-http so it runs under Netlify's AWS-Lambda-style function runtime.

const path = require('path');
const serverless = require('serverless-http');

const { app, initializeApp } = require(path.join(__dirname, '..', '..', 'backend', 'app'));

// Warm the database in the background. The app's /api middleware returns a
// clear HTTP 503 until the connection is established, and the cached promise
// is reused across warm invocations so we do not reconnect on every request.
initializeApp().catch((error) => {
  console.error('[netlify] database initialization failed:', error.message);
});

const wrapped = serverless(app);

function normalizePath(p) {
  if (!p) return p;
  // Depending on the redirect runtime, the /api prefix may be present or not.
  // Ensure Express (routers mounted under /api) sees a /api path.
  return p.startsWith('/api') ? p : '/api' + (p === '/' ? '' : p);
}

exports.handler = async (event, context) => {
  const normalized = normalizePath(event.path);
  if (normalized !== event.path) {
    event.path = normalized;
  }
  try {
    return await wrapped(event, context);
  } catch (error) {
    console.error('[netlify] unhandled error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Server error. Please try again.' }),
    };
  }
};