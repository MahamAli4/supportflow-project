const { DataTypes } = require('sequelize');
const inMemory = require('../services/inMemoryDb');

let MessageModel;

/**
 * Initialize Message model with Sequelize
 */
const initializeMessage = (sequelize) => {
  MessageModel = sequelize.define(
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

  return MessageModel;
};

const MessageProxy = new Proxy({}, {
  get(target, prop) {
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockMessage[prop] !== undefined) {
      return inMemory.MockMessage[prop];
    }
    return MessageModel ? MessageModel[prop] : undefined;
  },
});

module.exports = MessageProxy;
module.exports.initializeMessage = initializeMessage;
