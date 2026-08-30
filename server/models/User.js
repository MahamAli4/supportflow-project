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
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockUser[prop] !== undefined) {
      return inMemory.MockUser[prop];
    }
    return UserModel ? UserModel[prop] : undefined;
  },
});

module.exports = UserProxy;
module.exports.initializeUser = initializeUser;
