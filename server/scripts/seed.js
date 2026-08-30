const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const { generateNextTicketNumber } = require('../utils/ticketNumber');

dotenv.config();

/**
 * Idempotent Seed Function
 * Creates default Customer, Agent, and Super Admin accounts, and sample ticket/messages.
 */
const seedData = async () => {
  console.log('[Seed] Starting idempotent database seed...');

  // 1. Seed Customer User
  const customerEmail = 'customer@supportflow.demo';
  let customer = await User.findOne({ where: { email: customerEmail } });

  if (!customer) {
    const passwordHash = await bcrypt.hash('Customer123!', 10);
    customer = await User.create({
      name: 'Demo Customer',
      email: customerEmail,
      passwordHash,
      role: 'customer',
    });
    console.log(`[Seed] Created Customer user: ${customer.email} (ID: ${customer.id})`);
  } else {
    console.log(`[Seed] Customer user already exists: ${customer.email}`);
  }

  // 2. Seed Agent User
  const agentEmail = 'agent@supportflow.demo';
  let agent = await User.findOne({ where: { email: agentEmail } });

  if (!agent) {
    const passwordHash = await bcrypt.hash('Agent123!', 10);
    agent = await User.create({
      name: 'Demo Support Agent',
      email: agentEmail,
      passwordHash,
      role: 'agent',
    });
    console.log(`[Seed] Created Agent user: ${agent.email} (ID: ${agent.id})`);
  } else {
    console.log(`[Seed] Agent user already exists: ${agent.email}`);
  }

  // 3. Seed Super Admin User
  const adminEmail = 'admin@supportflow.demo';
  let admin = await User.findOne({ where: { email: adminEmail } });

  if (!admin) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    admin = await User.create({
      name: 'Super System Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`[Seed] Created Super Admin user: ${admin.email} (ID: ${admin.id})`);
  } else {
    console.log(`[Seed] Super Admin user already exists: ${admin.email}`);
  }

  // 4. Sample ticket & message seeding
  const existingTickets = await Ticket.count();
  if (existingTickets === 0) {
    const ticketNumber = await generateNextTicketNumber();
    const ticket = await Ticket.create({
      ticketNumber,
      customerId: customer.id,
      assignedAgentId: agent.id,
      subject: 'Sample Ticket: Account Billing Inquiry',
      description: 'I need assistance reviewing my recent billing statement and subscription plan.',
      category: 'Billing',
      priority: 'Medium',
      summary: 'Customer inquiring about subscription billing details.',
      status: 'Assigned',
      aiSuggestion: {
        category: 'Billing',
        priority: 'Medium',
        summary: 'Billing inquiry requesting statement breakdown.',
      },
      aiStatus: 'success',
      triageReviewed: true,
    });
    console.log(`[Seed] Created sample ticket: ${ticket.ticketNumber}`);

    await Message.create({
      ticketId: ticket.id,
      senderId: customer.id,
      senderRole: 'customer',
      message: 'Hello, could you help me verify the line items on my latest invoice?',
    });

    await Message.create({
      ticketId: ticket.id,
      senderId: agent.id,
      senderRole: 'agent',
      message: 'Hi Demo Customer! I am reviewing your account and will provide a detailed breakdown shortly.',
    });
    console.log(`[Seed] Created initial conversation messages for ${ticket.ticketNumber}`);
  } else {
    console.log(`[Seed] Tickets already exist (${existingTickets} tickets found), skipping sample ticket seed.`);
  }

  console.log('[Seed] Database seed completed successfully.');
  console.log('');
  console.log('  Login Credentials:');
  console.log('  - Admin:    admin@supportflow.demo    / Admin123!');
  console.log('  - Agent:    agent@supportflow.demo    / Agent123!');
  console.log('  - Customer: customer@supportflow.demo / Customer123!');
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
