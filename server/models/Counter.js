const { DataTypes } = require('sequelize');
const inMemory = require('../services/inMemoryDb');

let CounterModel;

/**
 * Initialize Counter model with Sequelize (used for auto-incrementing ticket numbers)
 */
const initializeCounter = (sequelize) => {
  CounterModel = sequelize.define(
    'Counter',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      seq: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: false,
      tableName: 'counters',
    }
  );

  return CounterModel;
};

const CounterProxy = new Proxy({}, {
  get(target, prop) {
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockCounter[prop] !== undefined) {
      return inMemory.MockCounter[prop];
    }
    return CounterModel ? CounterModel[prop] : undefined;
  },
});

module.exports = CounterProxy;
module.exports.initializeCounter = initializeCounter;
