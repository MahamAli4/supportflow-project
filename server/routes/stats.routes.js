const express = require('express');
const router = express.Router();
const { getCustomerStats, getAgentStats } = require('../controllers/stats.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/customer', protect, authorize('customer'), getCustomerStats);
router.get('/agent', protect, authorize('agent'), getAgentStats);

module.exports = router;
