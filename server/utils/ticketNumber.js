const Counter = require('../models/Counter');

/**
 * Generates an atomic, concurrency-safe ticket number.
 * Uses PostgreSQL upsert (findOrCreate + increment) or InMemory mock.
 * Formats: SF-000001, SF-000002, etc.
 *
 * @param {string} [sequenceName='ticketNumber'] - Counter document ID
 * @param {string} [prefix='SF-'] - Ticket number prefix
 * @returns {Promise<string>} Formatted ticket number
 */
const generateNextTicketNumber = async (sequenceName = 'ticketNumber', prefix = 'SF-') => {
  // InMemory mode uses MockCounter.findOneAndUpdate directly
  if (global.__USE_IN_MEMORY_DB__) {
    const counter = await Counter.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const formattedSeq = String(counter.seq).padStart(6, '0');
    return `${prefix}${formattedSeq}`;
  }

  // PostgreSQL mode: upsert + increment using Sequelize
  const [counter] = await Counter.findOrCreate({
    where: { id: sequenceName },
    defaults: { seq: 0 },
  });

  counter.seq = (counter.seq || 0) + 1;
  await counter.save();

  const formattedSeq = String(counter.seq).padStart(6, '0');
  return `${prefix}${formattedSeq}`;
};

module.exports = {
  generateNextTicketNumber,
};
