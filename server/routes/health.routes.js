const express = require('express');
const { getSequelize } = require('../config/db');
const router = express.Router();

// GET /api/health - Health check endpoint returning API and database status
router.get('/', async (req, res) => {
  let dbStatus = 'Disconnected';

  try {
    if (global.__USE_IN_MEMORY_DB__) {
      dbStatus = 'In-Memory (Demo Mode)';
    } else {
      const sequelize = getSequelize();
      if (sequelize) {
        await sequelize.authenticate();
        dbStatus = 'Connected (PostgreSQL)';
      }
    }
  } catch {
    dbStatus = 'Disconnected';
  }

  return res.status(200).json({
    success: true,
    message: 'SupportFlow API Server is running',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    phase: 'Phase 1 Foundation',
  });
});

module.exports = router;
