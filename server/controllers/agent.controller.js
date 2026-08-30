const Ticket = require('../models/Ticket');
const { isValidStatusTransition, isTicketLocked } = require('../utils/statusTransition');
const { updateTicketStatusSchema, resolveTicketSchema, triageReviewSchema } = require('../validators/ticket.validator');

/**
 * @desc    Get tickets assigned to current authenticated agent (with status/priority filters)
 * @route   GET /api/agent/tickets
 * @access  Private (Agent)
 */
const getAgentTickets = async (req, res, next) => {
  try {
    const { status, priority } = req.query;

    const currentUserId = (req.user._id || req.user.id || '').toString();
    const query = { assignedAgentId: currentUserId };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .populate('customerId', 'name email role')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ticket status (Agent assigned to ticket only)
 * @route   PATCH /api/agent/tickets/:id/status
 * @access  Private (Agent)
 */
const updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // 1. Ownership check: Agent must be assigned to ticket
    const assignedAgentId = (ticket.assignedAgentId?._id || ticket.assignedAgentId?.id || ticket.assignedAgentId || '').toString();
    const currentUserId = (req.user._id || req.user.id || '').toString();

    if (!assignedAgentId || assignedAgentId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not assigned to this ticket',
      });
    }

    // 2. Lock check: Cannot update resolved tickets
    if (isTicketLocked(ticket.status)) {
      return res.status(400).json({
        success: false,
        error: 'Ticket is resolved and locked from further status updates',
      });
    }

    // 3. Zod input validation
    const validationResult = updateTicketStatusSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { status: nextStatus, resolutionNote } = validationResult.data;

    // 4. Status transition validation
    if (!isValidStatusTransition(ticket.status, nextStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status transition from '${ticket.status}' to '${nextStatus}'`,
      });
    }

    // 5. Resolution requirement check
    if (nextStatus === 'Resolved') {
      const note = resolutionNote ? resolutionNote.trim() : '';
      if (!note) {
        return res.status(400).json({
          success: false,
          error: 'A non-empty resolution note is required when resolving a ticket',
        });
      }
      ticket.resolutionNote = note;
      ticket.resolvedAt = new Date();
    }

    ticket.status = nextStatus;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('customerId', 'name email role')
      .populate('assignedAgentId', 'name email role');

    // Emit Socket.IO status_change event ONLY after MongoDB persistence
    const io = req.app.get('io');
    if (io) {
      io.to(`ticket:${ticket._id}`).emit('status_change', {
        ticketId: ticket._id,
        status: ticket.status,
        resolutionNote: ticket.resolutionNote,
        resolvedAt: ticket.resolvedAt,
        ticket: updatedTicket,
      });
    }

    return res.status(200).json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve a ticket with resolution note (Agent assigned to ticket only)
 * @route   POST /api/agent/tickets/:id/resolve
 * @access  Private (Agent)
 */
const resolveTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // 1. Ownership check: Agent must be assigned to ticket
    if (!ticket.assignedAgentId || ticket.assignedAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not assigned to this ticket',
      });
    }

    // 2. Lock check
    if (isTicketLocked(ticket.status)) {
      return res.status(400).json({
        success: false,
        error: 'Ticket is already resolved',
      });
    }

    // 3. Zod resolution note validation
    const validationResult = resolveTicketSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { resolutionNote } = validationResult.data;

    // 4. Update status to Resolved
    ticket.status = 'Resolved';
    ticket.resolutionNote = resolutionNote.trim();
    ticket.resolvedAt = new Date();
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('customerId', 'name email role')
      .populate('assignedAgentId', 'name email role');

    // Emit Socket.IO status_change event ONLY after MongoDB persistence
    const io = req.app.get('io');
    if (io) {
      io.to(`ticket:${ticket._id}`).emit('status_change', {
        ticketId: ticket._id,
        status: ticket.status,
        resolutionNote: ticket.resolutionNote,
        resolvedAt: ticket.resolvedAt,
        ticket: updatedTicket,
      });
    }

    return res.status(200).json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm & edit AI triage suggestion (Agent assigned to ticket only)
 * @route   PATCH /api/agent/tickets/:id/triage
 * @access  Private (Agent)
 */
const confirmTriageReview = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // 1. Ownership check: Agent must be assigned to ticket
    if (!ticket.assignedAgentId || ticket.assignedAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not assigned to this ticket',
      });
    }

    // 2. Zod triage review input validation
    const validationResult = triageReviewSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { category, priority, summary } = validationResult.data;

    // 3. Update authoritative final ticket fields while preserving original aiSuggestion
    ticket.category = category;
    ticket.priority = priority;
    ticket.summary = summary;
    ticket.triageReviewed = true;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('customerId', 'name email role')
      .populate('assignedAgentId', 'name email role');

    // Emit Socket.IO triage_reviewed event ONLY after MongoDB persistence
    const io = req.app.get('io');
    if (io) {
      io.to(`ticket:${ticket._id}`).emit('triage_reviewed', {
        ticketId: ticket._id,
        category: ticket.category,
        priority: ticket.priority,
        summary: ticket.summary,
        triageReviewed: ticket.triageReviewed,
        ticket: updatedTicket,
      });
    }

    return res.status(200).json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgentTickets,
  updateTicketStatus,
  resolveTicket,
  confirmTriageReview,
};
