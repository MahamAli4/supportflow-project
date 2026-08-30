const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, getTicketById } = require('../controllers/ticket.controller');
const { getMessages, createMessage } = require('../controllers/message.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Customer Ticket Creation
router.post('/', protect, authorize('customer'), createTicket);

// Customer Ticket Listing
router.get('/my', protect, authorize('customer'), getMyTickets);

// Single Ticket Retrieval (Customer owner or assigned Agent)
router.get('/:id', protect, getTicketById);

// Message Conversation Sub-routes
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, createMessage);

module.exports = router;
