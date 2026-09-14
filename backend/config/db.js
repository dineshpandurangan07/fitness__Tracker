const mongoose = require('mongoose');

let mongod = null;

// Redact any credentials that might appear inside a connection error message
// (e.g. a full mongodb://user:pass@host URI) before surfacing it in /health.
const sanitize = (msg = '') =>
  String(msg).replace(/\/\/[^@\s]+@/g, '//***@');

const connectDB = async () => {
  connectDB.lastError = null;

const connectDB = async () => {
  mongoose.set('strictQuery', false);
  mongoose.set('bufferCommands', false);

  const connUri = process.env.MONGO_URI;
  const memoryAllowed = process.env.ALLOW_MEMORY_DB === 'true';

  // Serverless/cloud environments never have a local mongod. If MONGO_URI is
  // missing and we are not explicitly running the dev in-memory fallback,
  // fail fast with a message that points at the real fix instead of waiting
  // on a localhost timeout.
  if (!connUri && !memoryAllowed) {
    throw new Error(
      'MONGO_URI is not configured. Set the MONGO_URI environment variable (e.g. a MongoDB Atlas connection string) in your hosting environment, then redeploy.'
    );
  }

  if (connUri) {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const conn = await mongoose.connect(connUri, {
        serverSelectionTimeoutMS: isProd ? 15000 : 3000,
        maxPoolSize: isProd ? 5 : 10,
        retryWrites: true,
      });
      console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
      return;
    } catch (error) {
      connectDB.lastError = sanitize(error.message);
      console.warn(`MongoDB connection to configured URI failed: ${connectDB.lastError}`);
      if (!memoryAllowed) throw error;
      console.log('Falling back to in-memory MongoDB (local development only).');
    }
  }

  // In-memory fallback for local development only. Never reached in the cloud
  // because ALLOW_MEMORY_DB is only set in the local backend/.env file.
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri, { maxPoolSize: 10 });
    console.log(`In-Memory MongoDB Connected successfully: ${memoryUri}`);
} catch (memErr) {
      connectDB.lastError = sanitize(memErr.message);
      console.error('Failed to initialize In-Memory MongoDB:', connectDB.lastError);
      throw memErr;
    }
};

module.exports = connectDB;