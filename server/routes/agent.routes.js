const express = require('express');
const router = express.Router();
const { getAgentTickets, updateTicketStatus, resolveTicket, confirmTriageReview } = require('../controllers/agent.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All agent endpoints require agent role authorization
router.use(protect, authorize('agent'));

router.get('/tickets', getAgentTickets);
router.patch('/tickets/:id/status', updateTicketStatus);
router.post('/tickets/:id/resolve', resolveTicket);
router.patch('/tickets/:id/triage', confirmTriageReview);

module.exports = router;
