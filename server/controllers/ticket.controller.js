const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { generateNextTicketNumber } = require('../utils/ticketNumber');
const { createTicketSchema } = require('../validators/ticket.validator');
const { triageTicketWithAI } = require('../services/aiService');

/**
 * @desc    Create a new support ticket (Customer only) with AI Triage Integration & Auto-Classification
 * @route   POST /api/tickets
 * @access  Private (Customer)
 */
const createTicket = async (req, res, next) => {
  try {
    // 1. Zod input validation
    const validationResult = createTicketSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { subject, description, category, priority } = validationResult.data;

    // 2. Generate safe atomic ticket number
    const ticketNumber = await generateNextTicketNumber();

    // 3. Find an available support agent to assign
    const availableAgent = await User.findOne({ role: 'agent' });
    const assignedAgentId = availableAgent ? availableAgent._id : null;
    const initialStatus = assignedAgentId ? 'Assigned' : 'New';

    // 4. Create initial ticket record
    const ticket = await Ticket.create({
      ticketNumber,
      customerId: req.user._id,
      assignedAgentId,
      subject,
      description,
      category: category || 'General',
      priority: priority || 'Medium',
      status: initialStatus,
      aiSuggestion: {
        category: null,
        priority: null,
        summary: null,
      },
      aiStatus: 'pending',
      triageReviewed: false,
    });

    // 5. Trigger AI Agent Triage Analysis (OpenAI / Gemini)
    const aiResult = await triageTicketWithAI({
      subject,
      description,
      category,
    });

    if (aiResult.success) {
      ticket.aiSuggestion = aiResult.suggestion;
      ticket.aiStatus = 'success';

      // Auto-classify initial priority & category suggested by AI Agent
      if (aiResult.suggestion.priority) {
        ticket.priority = aiResult.suggestion.priority;
      }
      if (aiResult.suggestion.category) {
        ticket.category = aiResult.suggestion.category;
      }
      if (aiResult.suggestion.summary) {
        ticket.summary = aiResult.suggestion.summary;
      }
    } else {
      ticket.aiStatus = 'failed';
      ticket.aiSuggestion = { category: null, priority: null, summary: null };
    }

    // Keep triageReviewed = false until an agent explicitly confirms/edits
    ticket.triageReviewed = false;
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customerId', 'name email role')
      .populate('assignedAgentId', 'name email role');

    return res.status(201).json({
      success: true,
      ticket: populatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tickets for current authenticated customer
 * @route   GET /api/tickets/my
 * @access  Private (Customer)
 */
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ customerId: req.user._id })
      .populate('assignedAgentId', 'name email role')
      .sort({ createdAt: -1 });

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
 * @desc    Get ticket by ID (Customer owns ticket or Agent is assigned)
 * @route   GET /api/tickets/:id
 * @access  Private (Customer / Agent)
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customerId', 'name email role')
      .populate('assignedAgentId', 'name email role');

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Backend Authorization Check
    const isCustomerOwner = ticket.customerId._id.toString() === req.user._id.toString();
    const isAssignedAgent =
      ticket.assignedAgentId && ticket.assignedAgentId._id.toString() === req.user._id.toString();

    if (req.user.role === 'customer' && !isCustomerOwner) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to view another customer ticket',
      });
    }

    if (req.user.role === 'agent' && !isAssignedAgent) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not assigned to this ticket',
      });
    }

    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
};
