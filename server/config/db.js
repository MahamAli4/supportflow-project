const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database using MONGODB_URI environment variable.
 * @param {string} [customUri] - Optional URI override (useful for testing)
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/supportflow';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    if (!customUri) {
      process.exit(1);
    }
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
