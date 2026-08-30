const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/health - Health check endpoint returning API and database status
router.get('/', (req, res) => {
  const dbStateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const dbState = mongoose.connection ? mongoose.connection.readyState : 0;

  res.status(200).json({
    success: true,
    message: 'SupportFlow API Server is running',
    timestamp: new Date().toISOString(),
    database: dbStateMap[dbState] || 'Unknown',
    phase: 'Phase 1 Foundation',
  });
});

module.exports = router;
