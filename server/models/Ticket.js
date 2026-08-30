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

const TicketProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'initializeTicket') return initializeTicket;
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockTicket[prop] !== undefined) {
      return inMemory.MockTicket[prop];
    }
    return TicketModel ? TicketModel[prop] : undefined;
  },
});

module.exports = TicketProxy;
