const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitness_tracker';

    mongoose.set('strictQuery', false);
    mongoose.set('bufferCommands', false);

    let primaryErr;

    try {
      // Short timeout in dev so we fall back quickly if local mongod is not active.
      // Longer timeout in production (serverless cold starts / Atlas latency).
      const timeout = process.env.NODE_ENV === 'production' ? 10000 : 3000;
      const conn = await mongoose.connect(connUri, {
        serverSelectionTimeoutMS: timeout,
        maxPoolSize: process.env.NODE_ENV === 'production' ? 5 : 10,
        retryWrites: true,
      });
      console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
      return;
    } catch (error) {
      primaryErr = error;
      console.warn(`Standard MongoDB connection to ${connUri} failed: ${primaryErr.message}`);

      if (process.env.NODE_ENV === 'production') {
        throw primaryErr;
      }

      console.log('Attempting in-memory MongoDB fallback for local development...');
    }

    // In-memory fallback for local development only (never in production).
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri, { maxPoolSize: 10 });
      console.log(`In-Memory MongoDB Connected successfully: ${memoryUri}`);
    } catch (memErr) {
      console.error('Failed to initialize In-Memory MongoDB:', memErr.message);
      throw memErr;
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
