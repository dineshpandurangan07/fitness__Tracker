// Vercel serverless function that runs the FitPulse Express API.
//
// The same Express app used for local development (backend/app.js) is served
// inside this function. Vercel's Node.js function runtime hands this handler
// native http.IncomingMessage / http.ServerResponse objects, so Express can be
// used directly — body parsing, routing, and responses work exactly as locally.

const { app, initializeApp } = require('../backend/app');

// Warm the database in the background. The app's /api middleware returns a
// clear HTTP 503 until the connection is established, and the cached promise
// is reused on warm invocations so we do not reconnect on every request.
initializeApp().catch((error) => {
  console.error('[api] database initialization failed:', error.message);
});

function normalizeUrl(rawUrl) {
  const [pathname = '/', query = ''] = String(rawUrl || '/').split('?');
  let normalized = pathname;
  // Depending on runtime behavior, Vercel's /api/* rewrite may or may not
  // preserve the /api prefix. Ensure Express sees a /api path so its routers
  // (mounted under /api) match correctly.
  if (!normalized.startsWith('/api')) {
    normalized = '/api' + (normalized === '/' ? '' : normalized);
  }
  return query ? `${normalized}?${query}` : normalized;
}

module.exports = async function handler(vercelReq, vercelRes) {
  try {
    vercelReq.url = normalizeUrl(vercelReq.url);
    app(vercelReq, vercelRes);
  } catch (error) {
    console.error('[api] unhandled error:', error);
    if (!vercelRes.headersSent) {
      vercelRes.statusCode = 500;
      vercelRes.setHeader('Content-Type', 'application/json');
      vercelRes.end(JSON.stringify({ success: false, message: 'Server error. Please try again.' }));
    }
  }
};