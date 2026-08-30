const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const inMemory = require('../services/inMemoryDb');

const MongooseCounter = mongoose.model('Counter', counterSchema);

const CounterProxy = new Proxy(MongooseCounter, {
  get(target, prop) {
    if (global.__USE_IN_MEMORY_DB__ && inMemory.MockCounter[prop]) {
      return inMemory.MockCounter[prop];
    }
    return target[prop];
  },
});

module.exports = CounterProxy;
