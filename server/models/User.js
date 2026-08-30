const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const inMemory = require('../services/inMemoryDb');

let UserModel;

/**
 * Initialize User model with Sequelize
 */
const initializeUser = (sequelize) => {
  UserModel = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [2, 50],
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('customer', 'agent', 'admin'),
        defaultValue: 'customer',
      },
    },
    {
      timestamps: true,
      tableName: 'users',
    }
  );

  // Static method to hash password
  UserModel.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  // Instance method to compare passwords
  UserModel.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  };

  return UserModel;
};

const UserProxy = new Proxy({}, {
  get(target, prop) {
    // Pass through the initialize function directly
    if (prop === 'initializeUser') return initializeUser;

    // InMemory mode — use mock directly
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockUser[prop] !== undefined) {
      return inMemory.MockUser[prop];
    }

    if (!UserModel) return undefined;

    // MongoDB→Sequelize adapters for controllers
    if (prop === 'findOne') {
      return (query = {}) => {
        const where = query.where || (query.email ? { email: query.email }
          : query.role ? { role: query.role }
          : query._id ? { id: query._id }
          : query.id ? { id: query.id } : {});
        const result = UserModel.findOne({ where });
        result.select = () => result; // no-op for chaining
        return result;
      };
    }

    if (prop === 'findById') {
      return (id) => {
        const result = UserModel.findOne({ where: { id } });
        result.select = () => result;
        return result;
      };
    }

    if (prop === 'find') {
      return (query = {}) => {
        const where = query.role ? { role: query.role } : {};
        const result = UserModel.findAll({ where });
        result.select = () => result;
        result.sort = () => result;
        return result;
      };
    }

    if (prop === 'countDocuments') {
      return (query = {}) => {
        const where = query.role ? { role: query.role } : {};
        return UserModel.count({ where });
      };
    }

    if (prop === 'hashPassword') {
      return UserModel.hashPassword;
    }

    return UserModel[prop];
  },
});

module.exports = UserProxy;
