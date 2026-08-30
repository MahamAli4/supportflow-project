const { Sequelize } = require('sequelize');
const inMemory = require('../services/inMemoryDb');

let sequelize;

/**
 * Establishes connection to PostgreSQL database or falls back to in-memory store.
 * Also initializes all Sequelize models on successful connection.
 * @param {string} [customUri] - Optional URI override
 * @returns {Promise<Sequelize | object>}
 */
const connectDB = async (customUri) => {
  const uri =
    customUri ||
    process.env.DATABASE_URL ||
    'postgresql://supportflow_user:supportflow_password@localhost:5432/supportflow';

  try {
    sequelize = new Sequelize(uri, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        // SSL only needed for external cloud databases (RDS, Heroku, etc.)
        // Docker internal network does NOT need SSL
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
    });

    await sequelize.authenticate();
    console.log(`[Database] PostgreSQL Connected: ${sequelize.config.host}`);

    // Initialize all models
    const { initializeUser } = require('../models/User');
    const { initializeTicket } = require('../models/Ticket');
    const { initializeMessage } = require('../models/Message');
    const { initializeCounter } = require('../models/Counter');

    initializeUser(sequelize);
    initializeTicket(sequelize);
    initializeMessage(sequelize);
    initializeCounter(sequelize);

    // Sync models with database (alter in dev, safe in production)
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
