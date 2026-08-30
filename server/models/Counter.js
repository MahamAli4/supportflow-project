const { DataTypes } = require('sequelize');
const inMemory = require('../services/inMemoryDb');

let Counter;

/**
 * Initialize Counter model with Sequelize (used for auto-incrementing ticket numbers)
 */
const initializeCounter = (sequelize) => {
  Counter = sequelize.define(
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

  return Counter;
};

const CounterProxy = new Proxy({}, {
  get(target, prop) {
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockCounter[prop]) {
      return inMemory.MockCounter[prop];
    }
    return Counter ? Counter[prop] : undefined;
  },
});

// Named exports for initialization, default proxy for utils
module.exports = CounterProxy;
module.exports.initializeCounter = initializeCounter;
module.exports.CounterProxy = CounterProxy;
