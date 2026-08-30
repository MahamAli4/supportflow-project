const { DataTypes } = require('sequelize');
const inMemory = require('../services/inMemoryDb');

let TicketModel;

/**
 * Initialize Ticket model with Sequelize
 */
const initializeTicket = (sequelize) => {
  TicketModel = sequelize.define(
    'Ticket',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ticketNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      assignedAgentId: {
        type: DataTypes.UUID,
        defaultValue: null,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium',
      },
      summary: {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
      status: {
        type: DataTypes.ENUM('New', 'Assigned', 'In Progress', 'Resolved'),
        defaultValue: 'New',
      },
      aiSuggestion: {
        type: DataTypes.JSONB,
        defaultValue: { category: null, priority: null, summary: null },
      },
      aiStatus: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        defaultValue: 'pending',
      },
      triageReviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      resolutionNote: {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
      resolvedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
    },
    {
      timestamps: true,
      tableName: 'tickets',
    }
  );

  return TicketModel;
};

// Helper to attach user data for populate simulation
const populateTicketData = async (ticket) => {
  if (!ticket) return null;
  const UserModel2 = require('./User');
  const plain = ticket.toJSON ? ticket.toJSON() : { ...ticket };
  plain._id = plain.id;
  if (plain.customerId) {
    const u = await UserModel2.findOne({ where: { id: plain.customerId } });
    if (u) plain.customerId = { _id: u.id, id: u.id, name: u.name, email: u.email, role: u.role };
  }
  if (plain.assignedAgentId) {
    const u = await UserModel2.findOne({ where: { id: plain.assignedAgentId } });
    if (u) plain.assignedAgentId = { _id: u.id, id: u.id, name: u.name, email: u.email, role: u.role };
  }
  plain.save = () => ticket.save();
  return plain;
};

const TicketProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'initializeTicket') return initializeTicket;

    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockTicket[prop] !== undefined) {
      return inMemory.MockTicket[prop];
    }

    if (!TicketModel) return undefined;

    if (prop === 'findById') {
      return (id) => {
        let doPopulate = false;
        const promise = (async () => {
          const t = await TicketModel.findOne({ where: { id } });
          if (!t) return null;
          if (doPopulate) return populateTicketData(t);
          const plain = t.toJSON(); plain._id = plain.id; plain.save = () => t.save();
          return plain;
        })();
        promise.populate = () => { doPopulate = true; return promise; };
        return promise;
      };
    }

    if (prop === 'findOne') {
      return (query = {}) => {
        const where = query.where || (query.ticketNumber ? { ticketNumber: query.ticketNumber }
          : query._id ? { id: query._id } : query.id ? { id: query.id } : {});
        return TicketModel.findOne({ where }).then(t => {
          if (!t) return null;
          const plain = t.toJSON(); plain._id = plain.id; plain.save = () => t.save();
          return plain;
        });
      };
    }

    if (prop === 'find') {
      return (query = {}) => {
        const where = {};
        if (query.customerId) where.customerId = query.customerId;
        if (query.assignedAgentId) where.assignedAgentId = query.assignedAgentId;
        if (query.status) { if (typeof query.status === 'string') where.status = query.status; }
        if (query.priority) where.priority = query.priority;
        if (query.category) where.category = query.category;
        let doPopulate = false;
        const promise = (async () => {
          const tickets = await TicketModel.findAll({ where, order: [['createdAt', 'DESC']] });
          const plains = await Promise.all(tickets.map(async t => {
            if (doPopulate) return populateTicketData(t);
            const plain = t.toJSON(); plain._id = plain.id; plain.save = () => t.save();
            return plain;
          }));
          return plains;
        })();
        promise.populate = () => { doPopulate = true; return promise; };
        promise.sort = () => promise;
        return promise;
      };
    }

    if (prop === 'countDocuments') {
      return (query = {}) => {
        const where = {};
        if (query.customerId) where.customerId = query.customerId;
        if (query.assignedAgentId) where.assignedAgentId = query.assignedAgentId;
        if (query.status && typeof query.status === 'string') where.status = query.status;
        if (query.priority) where.priority = query.priority;
        if (query.aiStatus) where.aiStatus = query.aiStatus;
        if (typeof query.triageReviewed === 'boolean') where.triageReviewed = query.triageReviewed;
        return TicketModel.count({ where });
      };
    }

    return TicketModel[prop];
  },
});

module.exports = TicketProxy;
