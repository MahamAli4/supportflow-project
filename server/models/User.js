const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const inMemory = require('../services/inMemoryDb');

let User;

/**
 * Initialize User model with Sequelize
 */
const initializeUser = (sequelize) => {
  User = sequelize.define(
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
        lowercase: true,
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: 'users',
    }
  );

  /**
   * Static method to hash password using bcrypt
   */
  User.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  /**
   * Instance method to compare candidate password with stored passwordHash
   */
  User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  };

  return User;
};

const UserProxy = new Proxy({}, {
  get(target, prop) {
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockUser[prop]) {
      return inMemory.MockUser[prop];
    }
    return User ? User[prop] : undefined;
  },
});

// Named exports for initialization, default proxy for controllers/middleware
module.exports = UserProxy;
module.exports.initializeUser = initializeUser;
module.exports.UserProxy = UserProxy;
