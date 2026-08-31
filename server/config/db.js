const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for MongoDB Atlas SRV connection strings
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

/**
 * Establishes connection to MongoDB database using MONGODB_URI.
 * Automatically seeds demo accounts if they don't exist yet.
 * @param {string} [customUri] - Optional URI override
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (customUri) => {
  const uri =
    customUri ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/supportflow';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed default demo accounts on startup if not already seeded
    try {
      const { seedData } = require('../scripts/seed');
      if (typeof seedData === 'function') {
        await seedData();
      }
    } catch (seedErr) {
      console.warn(`[Database Auto-Seed Warning] ${seedErr.message}`);
    }

    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error('Please ensure MongoDB is running or MONGODB_URI is provided in your .env / cloud configuration.');
    throw error;
  }
};

/**
 * Disconnects from MongoDB database.
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB Disconnected');
  } catch (error) {
    console.error(`[Database Error] Disconnection failed: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
