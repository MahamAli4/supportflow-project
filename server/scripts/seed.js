const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const { generateNextTicketNumber } = require('../utils/ticketNumber');

dotenv.config();

/**
 * Idempotent Seed Function for MongoDB
 * Creates default Customer, Agent, and Super Admin accounts, and sample ticket/messages.
 */
const seedData = async () => {
  console.log('[Seed] Starting idempotent database seed...');

  // 1. Seed Customer User
  const customerEmail = 'customer@supportflow.demo';
  let customer = await User.findOne({ email: customerEmail.toLowerCase() });

  if (!customer) {
    const passwordHash = await User.hashPassword('Customer123!');
    customer = await User.create({
      name: 'Alex Johnson (Customer)',
      email: customerEmail.toLowerCase(),
      passwordHash,
      role: 'customer',
    });
    console.log(`[Seed] Created Customer user: ${customer.email} (ID: ${customer._id})`);
  } else {
    console.log(`[Seed] Customer user already exists: ${customer.email}`);
  }

  // 2. Seed Agent User
  const agentEmail = 'agent@supportflow.demo';
  let agent = await User.findOne({ email: agentEmail.toLowerCase() });

  if (!agent) {
    const passwordHash = await User.hashPassword('Agent123!');
    agent = await User.create({
      name: 'Sarah Connor (Support Agent)',
      email: agentEmail.toLowerCase(),
      passwordHash,
      role: 'agent',
    });
    console.log(`[Seed] Created Agent user: ${agent.email} (ID: ${agent._id})`);
  } else {
    console.log(`[Seed] Agent user already exists: ${agent.email}`);
  }

  // 3. Seed Super Admin User
  const adminEmail = 'admin@supportflow.demo';
  let admin = await User.findOne({ email: adminEmail.toLowerCase() });

  if (!admin) {
    const passwordHash = await User.hashPassword('Admin123!');
    admin = await User.create({
      name: 'Super System Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: 'admin',
    });
    console.log(`[Seed] Created Super Admin user: ${admin.email} (ID: ${admin._id})`);
  } else {
    console.log(`[Seed] Super Admin user already exists: ${admin.email}`);
  }

  // 4. Sample ticket & message seeding
  const existingTickets = await Ticket.countDocuments();
  if (existingTickets === 0) {
    const ticketNumber = await generateNextTicketNumber();
    const ticket = await Ticket.create({
      ticketNumber,
      customerId: customer._id,
      assignedAgentId: agent._id,
      subject: 'Double charge on subscription invoice #INV-9821',
      description: 'I noticed my credit card was charged twice for $49 on yesterday billing cycle. Please refund one charge.',
      category: 'Billing',
      priority: 'High',
      summary: 'Customer requesting refund for duplicated $49 subscription charge.',
      status: 'In Progress',
      aiSuggestion: {
        category: 'Billing',
        priority: 'High',
        summary: 'Customer was double charged $49 on invoice #INV-9821 and needs refund.',
      },
      aiStatus: 'success',
      triageReviewed: true,
    });
    console.log(`[Seed] Created sample ticket: ${ticket.ticketNumber}`);

    await Message.create({
      ticketId: ticket._id,
      senderId: customer._id,
      senderRole: 'customer',
      message: 'Hello, here is my invoice #INV-9821 with duplicate transaction IDs.',
    });

    await Message.create({
      ticketId: ticket._id,
      senderId: agent._id,
      senderRole: 'agent',
      message: 'Hi Alex, I have verified the transaction logs and initiated a refund of $49 back to your card.',
    });
    console.log(`[Seed] Created initial conversation messages for ${ticket.ticketNumber}`);
  } else {
    console.log(`[Seed] Tickets already exist (${existingTickets} tickets found), skipping sample ticket seed.`);
  }

  console.log('[Seed] Database seed completed successfully.');
  return { customer, agent, admin };
};

// Script execution wrapper
const runSeed = async () => {
  try {
    await connectDB();
    await seedData();
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = { seedData };
