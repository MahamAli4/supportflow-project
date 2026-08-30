const { DataTypes } = require('sequelize');
const inMemory = require('../services/inMemoryDb');

let Message;

/**
 * Initialize Message model with Sequelize
 */
const initializeMessage = (sequelize) => {
  Message = sequelize.define(
    'Message',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      senderRole: {
        type: DataTypes.ENUM('customer', 'agent', 'admin'),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'messages',
    }
  );

  return Message;
};

const MessageProxy = new Proxy({}, {
  get(target, prop) {
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockMessage[prop]) {
      return inMemory.MockMessage[prop];
    }
    return Message ? Message[prop] : undefined;
  },
});

// Named exports for initialization, default proxy for controllers
module.exports = MessageProxy;
module.exports.initializeMessage = initializeMessage;
module.exports.MessageProxy = MessageProxy;
