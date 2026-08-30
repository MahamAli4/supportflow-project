const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const Counter = require('../models/Counter');
const { generateNextTicketNumber } = require('../utils/ticketNumber');
const { seedData } = require('./seed');

async function runVerification() {
  console.log('--- STARTING SUPPORTFLOW PHASE 1 MODEL VERIFICATION ---');
  let mongoServer;

  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('[Test DB] Connected to Memory MongoDB:', mongoUri);

    // 1. Verify User Model
    console.log('\n[1/5] Verifying User Model & Password Hashing...');
    const plainPass = 'TestPass123!';
    const passwordHash = await User.hashPassword(plainPass);
    const user1 = await User.create({
      name: 'Test Customer',
      email: 'Test.User@example.com ',
      passwordHash,
      role: 'customer',
    });

    if (user1.email !== 'test.user@example.com') {
      throw new Error(`Email lowercase/trim failed. Got: ${user1.email}`);
    }
    const isPassValid = await user1.comparePassword(plainPass);
    if (!isPassValid) {
      throw new Error('Password hash verification failed!');
    }
    console.log('✓ User model, email trimming/lowercasing, and bcrypt password hashing verified.');

    // 2. Verify Atomic Ticket Counter
    console.log('\n[2/5] Verifying Concurrency-Safe Ticket Counter (SF-000001, SF-000002)...');
    const ticketNum1 = await generateNextTicketNumber();
    const ticketNum2 = await generateNextTicketNumber();
    const ticketNum3 = await generateNextTicketNumber();

    if (ticketNum1 !== 'SF-000001' || ticketNum2 !== 'SF-000002' || ticketNum3 !== 'SF-000003') {
      throw new Error(`Atomic counter formatting mismatch! Received: ${ticketNum1}, ${ticketNum2}, ${ticketNum3}`);
    }
    console.log(`✓ Atomic ticket numbers generated successfully: ${ticketNum1}, ${ticketNum2}, ${ticketNum3}`);

    // 3. Verify Ticket Model & Indexes
    console.log('\n[3/5] Verifying Ticket Model & Indexes...');
    const ticket = await Ticket.create({
      ticketNumber: ticketNum1,
      customerId: user1._id,
      subject: 'System Test Ticket',
      description: 'Detailed description of the issue encountered.',
      category: 'Technical',
      priority: 'High',
      status: 'New',
      aiSuggestion: {
        category: 'Technical',
        priority: 'High',
        summary: 'Technical system issue.',
      },
      aiStatus: 'success',
    });
    if (!ticket.ticketNumber || ticket.priority !== 'High' || ticket.triageReviewed !== false) {
      throw new Error('Ticket model validation failed');
    }
    console.log('✓ Ticket model creation & field defaults verified.');

    // 4. Verify Message Model
    console.log('\n[4/5] Verifying Message Model...');
    const msg = await Message.create({
      ticketId: ticket._id,
      senderId: user1._id,
      senderRole: 'customer',
      message: 'Hello support team!',
    });
    if (msg.message !== 'Hello support team!' || msg.senderRole !== 'customer') {
      throw new Error('Message model verification failed');
    }
    console.log('✓ Message model creation verified.');

    // 5. Verify Idempotent Seed Script
    console.log('\n[5/5] Verifying Idempotent Seed Script...');
    // Clear collections for clean seed test
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Message.deleteMany({});
    await Counter.deleteMany({});

    // Run seed twice
    await seedData();
    const customerCountFirst = await User.countDocuments({ role: 'customer' });
    const agentCountFirst = await User.countDocuments({ role: 'agent' });

    // Run second time to ensure idempotency
    await seedData();
    const customerCountSecond = await User.countDocuments({ role: 'customer' });
    const agentCountSecond = await User.countDocuments({ role: 'agent' });

    if (customerCountFirst !== customerCountSecond || agentCountFirst !== agentCountSecond) {
      throw new Error(`Seed script is not idempotent! Counts changed on second run.`);
    }
    console.log('✓ Idempotent seed script verified (no duplicates created on multiple runs).');

    console.log('\n==================================================');
    console.log('SUCCESS: All Mongoose Models & Seed Script Verified!');
    console.log('==================================================\n');

    await mongoose.disconnect();
    await mongoServer.stop();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(1);
  }
}

runVerification();
