const Message = require('../models/Message');
const Ticket = require('../models/Ticket');
const { createMessageSchema } = require('../validators/ticket.validator');
const { isTicketLocked } = require('../utils/statusTransition');

/**
 * @desc    Get all messages for a ticket
 * @route   GET /api/tickets/:id/messages
 * @access  Private (Customer owner / Assigned agent)
 */
const getMessages = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Backend Authorization Check
    const isCustomerOwner = ticket.customerId.toString() === req.user._id.toString();
    const isAssignedAgent =
      ticket.assignedAgentId && ticket.assignedAgentId.toString() === req.user._id.toString();

    if (req.user.role === 'customer' && !isCustomerOwner) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You cannot view messages for another customer ticket',
      });
    }

    if (req.user.role === 'agent' && !isAssignedAgent) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not assigned to this ticket',
      });
    }

    const messages = await Message.find({ ticketId: ticket._id })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Post a new message on a ticket
 * @route   POST /api/tickets/:id/messages
 * @access  Private (Customer owner / Assigned agent)
 */
const createMessage = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // 1. Authorization Check
    const isCustomerOwner = ticket.customerId.toString() === req.user._id.toString();
    const isAssignedAgent =
      ticket.assignedAgentId && ticket.assignedAgentId.toString() === req.user._id.toString();

    if (req.user.role === 'customer' && !isCustomerOwner) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You cannot message on another customer ticket',
      });
    }

    if (req.user.role === 'agent' && !isAssignedAgent) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not assigned to this ticket',
      });
    }

    // 2. Lock Check: Resolved tickets are locked
    if (isTicketLocked(ticket.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot post messages on a resolved ticket',
      });
    }

    // 3. Zod input validation
    const validationResult = createMessageSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { message } = validationResult.data;

    // 4. Create and persist message in MongoDB
    const newMessage = await Message.create({
      ticketId: ticket._id,
      senderId: req.user._id,
      senderRole: req.user.role,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      'senderId',
      'name email role'
    );

    // 5. Real-time Socket.IO notification emission
    const io = req.app.get('io');
    if (io) {
      io.to(`ticket:${ticket._id}`).emit('new_message', populatedMessage);
    }

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  createMessage,
};
