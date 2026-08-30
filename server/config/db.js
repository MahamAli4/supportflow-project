const { Sequelize } = require('sequelize');
const inMemory = require('../services/inMemoryDb');

let sequelize;

/**
 * Establishes connection to PostgreSQL database or falls back to in-memory store.
 * @param {string} [customUri] - Optional URI override
 * @returns {Promise<Sequelize | object>}
 */
const connectDB = async (customUri) => {
  const uri = customUri || process.env.DATABASE_URL || 'postgresql://supportflow_user:supportflow_password@localhost:5432/supportflow';

  try {
    sequelize = new Sequelize(uri, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      },
    });

    await sequelize.authenticate();
    console.log(`[Database] PostgreSQL Connected: ${sequelize.config.host}`);
    
    // Sync models with database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('[Database] Models synchronized with database');
    
    global.__USE_IN_MEMORY_DB__ = false;
    return sequelize;
  } catch (error) {
    console.log(`[Database Notice] PostgreSQL not available (${error.message}).`);
    console.log(`[Database] Switching to High-Performance In-Memory DB Mode with Seeded Demo Accounts...`);
    global.__USE_IN_MEMORY_DB__ = true;
    await inMemory.seedInMemoryStore();
    return { isInMemory: true };
  }
};

/**
 * Disconnects from PostgreSQL database.
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    if (sequelize) {
      await sequelize.close();
      console.log('[Database] PostgreSQL Disconnected');
    }
  } catch (error) {
    console.error(`[Database Error] Disconnection failed: ${error.message}`);
  }
};

/**
 * Get the Sequelize instance for model definitions
 * @returns {Sequelize}
 */
const getSequelize = () => sequelize;

module.exports = {
  connectDB,
  disconnectDB,
  getSequelize,
};
