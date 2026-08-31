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
        values: ['customer', 'agent', 'admin'],
        message: 'Sender role must be customer, agent, or admin',
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

messageSchema.index({ ticketId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
