const serverless = require('serverless-http');
const { app, initializeApp } = require('../../backend/app');

// Warm the database in the background. The app's /api middleware returns a
// clear HTTP 503 until the connection is established, and the cached promise
// is reused across warm invocations so we do not reconnect on every request.
initializeApp().catch((error) => {
  console.error('[netlify] database initialization failed:', error.message);
});

const wrapped = serverless(app);

function normalizePath(p) {
  if (!p) return p;
  // When the frontend calls /.netlify/functions/api/... directly, strip the
  // function prefix so Express sees /api/... (the path its routers expect).
  const fnPrefix = '/.netlify/functions/api';
  if (p.startsWith(fnPrefix)) {
    return '/api' + p.slice(fnPrefix.length);
  }
  // When a rewrite brings a path like /auth/google, add the /api prefix.
  return p.startsWith('/api') ? p : '/api' + (p === '/' ? '' : p);
}

exports.handler = async (event, context) => {
  event.path = normalizePath(event.path);
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