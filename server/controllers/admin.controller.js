const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { createUserSchema } = require('../validators/admin.validator');

/**
 * @desc    Get global system-wide statistics (Admin only)
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalAgents,
      totalTickets,
      newTickets,
      assignedTickets,
      inProgressTickets,
      resolvedTickets,
      aiSuccessCount,
      triageReviewedCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'agent' }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'New' }),
      Ticket.countDocuments({ status: 'Assigned' }),
      Ticket.countDocuments({ status: 'In Progress' }),
      Ticket.countDocuments({ status: 'Resolved' }),
      Ticket.countDocuments({ aiStatus: 'success' }),
      Ticket.countDocuments({ triageReviewed: true }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalAgents,
        totalTickets,
        newTickets,
        assignedTickets,
        inProgressTickets,
        resolvedTickets,
        aiSuccessCount,
        triageReviewedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registered users with role filter (Admin only)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role && ['customer', 'agent', 'admin'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new User account (Customer or Support Agent) - Admin only
 * @route   POST /api/admin/users/create
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { name, email, password, role } = validationResult.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'A user with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'customer',
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all system tickets across all agents (Admin only)
 * @route   GET /api/admin/tickets
 * @access  Private (Admin)
 */
const getAllAdminTickets = async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('customerId', 'name email role')
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

module.exports = {
  getAdminStats,
  getAdminUsers,
  createUser,
  createAgent: createUser,
  getAllAdminTickets,
};
