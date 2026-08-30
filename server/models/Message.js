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
    if (prop === 'initializeMessage') return initializeMessage;

    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockMessage[prop] !== undefined) {
      return inMemory.MockMessage[prop];
    }

    if (!MessageModel) return undefined;

    if (prop === 'findById') {
      return (id) => {
        let doPopulate = false;
        const promise = (async () => {
          const m = await MessageModel.findOne({ where: { id } });
          if (!m) return null;
          const plain = m.toJSON(); plain._id = plain.id;
          if (doPopulate) {
            const UserModel2 = require('./User');
            const sender = await UserModel2.findOne({ where: { id: plain.senderId } });
            if (sender) plain.senderId = { _id: sender.id, id: sender.id, name: sender.name, email: sender.email, role: sender.role };
          }
          return plain;
        })();
        promise.populate = () => { doPopulate = true; return promise; };
        return promise;
      };
    }

    if (prop === 'find') {
      return (query = {}) => {
        const where = {};
        if (query.ticketId) where.ticketId = query.ticketId;
        let doPopulate = false;
        const promise = (async () => {
          const msgs = await MessageModel.findAll({ where, order: [['createdAt', 'ASC']] });
          const plains = await Promise.all(msgs.map(async m => {
            const plain = m.toJSON(); plain._id = plain.id;
            if (doPopulate) {
              const UserModel2 = require('./User');
              const sender = await UserModel2.findOne({ where: { id: plain.senderId } });
              if (sender) plain.senderId = { _id: sender.id, id: sender.id, name: sender.name, email: sender.email, role: sender.role };
            }
            return plain;
          }));
          return plains;
        })();
        promise.populate = () => { doPopulate = true; return promise; };
        promise.sort = () => promise;
        return promise;
      };
    }

    if (typeof MessageModel[prop] === 'function') {
      return MessageModel[prop].bind(MessageModel);
    }

    return MessageModel[prop];
  },
});

module.exports = MessageProxy;
