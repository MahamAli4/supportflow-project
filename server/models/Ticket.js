const mongoose = require('mongoose');

const aiSuggestionSchema = new mongoose.Schema(
  {
    category: { type: String, default: null },
    priority: { type: String, default: null },
    summary: { type: String, default: null },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      unique: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },
    summary: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Assigned', 'In Progress', 'Resolved'],
        message: 'Status must be New, Assigned, In Progress, or Resolved',
      },
      default: 'New',
    },
    aiSuggestion: {
      type: aiSuggestionSchema,
      default: () => ({}),
    },
    aiStatus: {
      type: String,
      enum: {
        values: ['pending', 'success', 'failed'],
        message: 'AI status must be pending, success, or failed',
      },
      default: 'pending',
    },
    triageReviewed: {
      type: Boolean,
      default: false,
    },
    resolutionNote: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Useful Indexes for query performance
ticketSchema.index({ customerId: 1, createdAt: -1 });
ticketSchema.index({ assignedAgentId: 1, status: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ category: 1 });

const inMemory = require('../services/inMemoryDb');

const MongooseTicket = mongoose.model('Ticket', ticketSchema);

const TicketProxy = new Proxy(MongooseTicket, {
  get(target, prop) {
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockTicket[prop]) {
      return inMemory.MockTicket[prop];
    }
    return target[prop];
  },
});

module.exports = TicketProxy;
