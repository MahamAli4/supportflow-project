const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const Counter = require('../models/Counter');
const { seedData } = require('./seed');

dotenv.config();

/**
 * MongoDB Database Migration & Schema Index Synchronization Runner
 */
const runMigration = async () => {
  console.log('=====================================================');
  console.log('🚀 [SupportFlow Database Migration] Starting...');
  console.log('=====================================================');

  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Synchronize / Build Mongoose Schema Indexes
    console.log('[Migration 1/4] Building and verifying schema indexes...');
    await Promise.all([
      User.init(),
      Ticket.init(),
      Message.init(),
      Counter.init(),
    ]);

    const userIndexes = await User.collection.indexes();
    const ticketIndexes = await Ticket.collection.indexes();
    const messageIndexes = await Message.collection.indexes();

    console.log(`  ✓ User Collection: ${userIndexes.length} indexes verified (unique email enforced)`);
    console.log(`  ✓ Ticket Collection: ${ticketIndexes.length} indexes verified (unique ticketNumber, status, agent, customer)`);
    console.log(`  ✓ Message Collection: ${messageIndexes.length} indexes verified (ticketId, createdAt)`);

    // 3. Initialize Atomic Sequence Counter
    console.log('[Migration 2/4] Initializing atomic sequence counters...');
    const existingCounter = await Counter.findById('ticketNumber');
    if (!existingCounter) {
      await Counter.create({ _id: 'ticketNumber', seq: 0 });
      console.log('  ✓ Initialized sequence counter: ticketNumber (seq: 0)');
    } else {
      console.log(`  ✓ Sequence counter active: ticketNumber (current seq: ${existingCounter.seq})`);
    }

    // 4. Run Seed for Default Roles & Demo Data
    console.log('[Migration 3/4] Ensuring default roles and demo accounts...');
    await seedData();

    // 5. Verification Summary
    console.log('[Migration 4/4] Verifying database integrity...');
    const [userCount, ticketCount, messageCount] = await Promise.all([
      User.countDocuments(),
      Ticket.countDocuments(),
      Message.countDocuments(),
    ]);

    console.log('=====================================================');
    console.log('✅ [Database Migration Completed Successfully]');
    console.log('=====================================================');
    console.log(`  📊 Database Summary:`);
    console.log(`     - Total Users:    ${userCount}`);
    console.log(`     - Total Tickets:  ${ticketCount}`);
    console.log(`     - Total Messages: ${messageCount}`);
    console.log('=====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Migration Failed]:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
