const Counter = require('../models/Counter');

/**
 * Generates an atomic, concurrency-safe ticket number using MongoDB findOneAndUpdate $inc operation.
 * Formats: SF-000001, SF-000002, etc.
 * 
 * @param {string} [sequenceName='ticketNumber'] - Counter document ID
 * @param {string} [prefix='SF-'] - Ticket number prefix
 * @returns {Promise<string>} Formatted ticket number
 */
const generateNextTicketNumber = async (sequenceName = 'ticketNumber', prefix = 'SF-') => {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(6, '0');
  return `${prefix}${formattedSeq}`;
};

module.exports = {
  generateNextTicketNumber,
};
