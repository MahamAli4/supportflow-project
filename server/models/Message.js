const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket ID is required'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    senderRole: {
      type: String,
      enum: {
        values: ['customer', 'agent'],
        message: 'Sender role must be customer or agent',
      },
      required: [true, 'Sender role is required'],
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for rapid retrieval of conversation messages by ticket ordered by creation time
messageSchema.index({ ticketId: 1, createdAt: 1 });

const inMemory = require('../services/inMemoryDb');

const MongooseMessage = mongoose.model('Message', messageSchema);

const MessageProxy = new Proxy(MongooseMessage, {
  get(target, prop) {
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockMessage[prop]) {
      return inMemory.MockMessage[prop];
    }
    return target[prop];
  },
});

module.exports = MessageProxy;
