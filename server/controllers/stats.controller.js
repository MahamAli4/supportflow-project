const Ticket = require('../models/Ticket');

/**
 * @desc    Get dashboard statistics for current customer
 * @route   GET /api/customer/stats
 * @access  Private (Customer)
 */
const getCustomerStats = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    const [total, open, inProgress, resolved] = await Promise.all([
      Ticket.countDocuments({ customerId }),
      Ticket.countDocuments({ customerId, status: { $in: ['New', 'Assigned'] } }),
      Ticket.countDocuments({ customerId, status: 'In Progress' }),
      Ticket.countDocuments({ customerId, status: 'Resolved' }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalTickets: total,
        openTickets: open,
        inProgressTickets: inProgress,
        resolvedTickets: resolved,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard statistics for current support agent
 * @route   GET /api/agent/stats
 * @access  Private (Agent)
 */
const getAgentStats = async (req, res, next) => {
  try {
    const assignedAgentId = req.user._id;

    const [assigned, highPriority, inProgress, resolved] = await Promise.all([
      Ticket.countDocuments({ assignedAgentId }),
      Ticket.countDocuments({ assignedAgentId, priority: 'High', status: { $ne: 'Resolved' } }),
      Ticket.countDocuments({ assignedAgentId, status: 'In Progress' }),
      Ticket.countDocuments({ assignedAgentId, status: 'Resolved' }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        assignedTickets: assigned,
        highPriorityTickets: highPriority,
        inProgressTickets: inProgress,
        resolvedTickets: resolved,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerStats,
  getAgentStats,
};
