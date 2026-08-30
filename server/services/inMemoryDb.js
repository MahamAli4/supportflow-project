const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// In-Memory Storage Tables
const memoryStore = {
  users: [],
  tickets: [],
  messages: [],
  counters: { ticketNumber: 0 },
};

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

// -------------------------------------------------------------
// USER MODEL MOCK
// -------------------------------------------------------------
class MockUserDoc {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.name = data.name;
    this.email = data.email ? data.email.toLowerCase() : '';
    this.passwordHash = data.passwordHash;
    this.role = data.role || 'customer';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  }

  toJSON() {
    const obj = { ...this };
    delete obj.passwordHash;
    return obj;
  }
}

const MockUser = {
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  async create(data) {
    let passwordHash = data.passwordHash;
    if (data.password && !passwordHash) {
      passwordHash = await MockUser.hashPassword(data.password);
    }
    const user = new MockUserDoc({ ...data, passwordHash });
    memoryStore.users.push(user);
    return user;
  },

  findOne(query = {}) {
    return {
      select: function () {
        return this;
      },
      then: function (resolve) {
        let match = null;
        if (query.email) {
          match = memoryStore.users.find((u) => u.email.toLowerCase() === query.email.toLowerCase());
        } else if (query.role) {
          match = memoryStore.users.find((u) => u.role === query.role);
        } else if (query._id) {
          match = memoryStore.users.find((u) => u._id.toString() === query._id.toString());
        }
        resolve(match || null);
      },
    };
  },

  findById(id) {
    return {
      select: function () {
        return this;
      },
      then: function (resolve) {
        const match = memoryStore.users.find((u) => u._id.toString() === id.toString());
        resolve(match || null);
      },
    };
  },

  find(query = {}) {
    return {
      select: function () {
        return this;
      },
      sort: function () {
        return this;
      },
      then: function (resolve) {
        let results = [...memoryStore.users];
        if (query.role) {
          results = results.filter((u) => u.role === query.role);
        }
        resolve(results);
      },
    };
  },

  countDocuments(query = {}) {
    return {
      then: function (resolve) {
        let count = memoryStore.users.length;
        if (query.role) {
          count = memoryStore.users.filter((u) => u.role === query.role).length;
        }
        resolve(count);
      },
    };
  },
};

// -------------------------------------------------------------
// TICKET MODEL MOCK
// -------------------------------------------------------------
class MockTicketDoc {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.ticketNumber = data.ticketNumber;
    this.customerId = data.customerId ? data.customerId.toString() : null;
    this.assignedAgentId = data.assignedAgentId ? data.assignedAgentId.toString() : null;
    this.subject = data.subject;
    this.description = data.description;
    this.category = data.category || 'General';
    this.priority = data.priority || 'Medium';
    this.summary = data.summary || '';
    this.status = data.status || 'New';
    this.aiSuggestion = data.aiSuggestion || { category: null, priority: null, summary: null };
    this.aiStatus = data.aiStatus || 'pending';
    this.triageReviewed = data.triageReviewed || false;
    this.resolutionNote = data.resolutionNote || '';
    this.resolvedAt = data.resolvedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = memoryStore.tickets.findIndex((t) => t._id.toString() === this._id.toString());
    if (idx !== -1) {
      memoryStore.tickets[idx] = this;
    } else {
      memoryStore.tickets.push(this);
    }
    return this;
  }
}

function populateTicket(ticket) {
  if (!ticket) return null;
  const cloned = { ...ticket };
  if (ticket.customerId) {
    const cust = memoryStore.users.find((u) => u._id.toString() === ticket.customerId.toString());
    cloned.customerId = cust ? { _id: cust._id, name: cust.name, email: cust.email, role: cust.role } : ticket.customerId;
  }
  if (ticket.assignedAgentId) {
    const ag = memoryStore.users.find((u) => u._id.toString() === ticket.assignedAgentId.toString());
    cloned.assignedAgentId = ag ? { _id: ag._id, name: ag.name, email: ag.email, role: ag.role } : null;
  }
  return cloned;
}

const MockTicket = {
  async create(data) {
    const ticket = new MockTicketDoc(data);
    memoryStore.tickets.push(ticket);
    return ticket;
  },

  findById(id) {
    let shouldPopulate = false;
    const queryObj = {
      populate: function () {
        shouldPopulate = true;
        return queryObj;
      },
      then: function (resolve) {
        const match = memoryStore.tickets.find((t) => t._id.toString() === id.toString());
        if (!match) return resolve(null);
        if (shouldPopulate) {
          const pop = populateTicket(match);
          pop.save = match.save.bind(match);
          return resolve(pop);
        }
        resolve(match);
      },
    };
    return queryObj;
  },

  findOne(query = {}) {
    return {
      then: function (resolve) {
        const match = memoryStore.tickets.find((t) => {
          if (query.ticketNumber && t.ticketNumber !== query.ticketNumber) return false;
          return true;
        });
        resolve(match || null);
      },
    };
  },

  find(query = {}) {
    let shouldPopulate = false;
    let sortObj = null;

    const queryObj = {
      populate: function () {
        shouldPopulate = true;
        return queryObj;
      },
      sort: function (s) {
        sortObj = s;
        return queryObj;
      },
      then: function (resolve) {
        let results = [...memoryStore.tickets];

        if (query.customerId) {
          results = results.filter((t) => t.customerId && t.customerId.toString() === query.customerId.toString());
        }
        if (query.assignedAgentId) {
          results = results.filter(
            (t) => t.assignedAgentId && t.assignedAgentId.toString() === query.assignedAgentId.toString()
          );
        }
        if (query.status) {
          if (typeof query.status === 'string') {
            results = results.filter((t) => t.status === query.status);
          } else if (query.status.$in) {
            results = results.filter((t) => query.status.$in.includes(t.status));
          } else if (query.status.$ne) {
            results = results.filter((t) => t.status !== query.status.$ne);
          }
        }
        if (query.priority) {
          results = results.filter((t) => t.priority === query.priority);
        }
        if (query.category) {
          results = results.filter((t) => t.category === query.category);
        }

        if (sortObj && sortObj.createdAt === -1) {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        if (shouldPopulate) {
          results = results.map((t) => populateTicket(t));
        }

        resolve(results);
      },
    };
    return queryObj;
  },

  countDocuments(query = {}) {
    return {
      then: function (resolve) {
        let results = [...memoryStore.tickets];

        if (query.customerId) {
          results = results.filter((t) => t.customerId && t.customerId.toString() === query.customerId.toString());
        }
        if (query.assignedAgentId) {
          results = results.filter(
            (t) => t.assignedAgentId && t.assignedAgentId.toString() === query.assignedAgentId.toString()
          );
        }
        if (query.status) {
          if (typeof query.status === 'string') {
            results = results.filter((t) => t.status === query.status);
          } else if (query.status.$in) {
            results = results.filter((t) => query.status.$in.includes(t.status));
          } else if (query.status.$ne) {
            results = results.filter((t) => t.status !== query.status.$ne);
          }
        }
        if (query.priority) {
          results = results.filter((t) => t.priority === query.priority);
        }
        if (query.aiStatus) {
          results = results.filter((t) => t.aiStatus === query.aiStatus);
        }
        if (typeof query.triageReviewed === 'boolean') {
          results = results.filter((t) => t.triageReviewed === query.triageReviewed);
        }

        resolve(results.length);
      },
    };
  },
};

// -------------------------------------------------------------
// MESSAGE MODEL MOCK
// -------------------------------------------------------------
class MockMessageDoc {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.ticketId = data.ticketId ? data.ticketId.toString() : null;
    this.senderId = data.senderId ? data.senderId.toString() : null;
    this.senderRole = data.senderRole;
    this.message = data.message;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

const MockMessage = {
  async create(data) {
    const msg = new MockMessageDoc(data);
    memoryStore.messages.push(msg);
    return msg;
  },

  findById(id) {
    let shouldPopulate = false;
    const queryObj = {
      populate: function () {
        shouldPopulate = true;
        return queryObj;
      },
      then: function (resolve) {
        const msg = memoryStore.messages.find((m) => m._id.toString() === id.toString());
        if (!msg) return resolve(null);
        if (shouldPopulate) {
          const sender = memoryStore.users.find((u) => u._id.toString() === msg.senderId.toString());
          return resolve({
            ...msg,
            senderId: sender
              ? { _id: sender._id, name: sender.name, email: sender.email, role: sender.role }
              : msg.senderId,
          });
        }
        resolve(msg);
      },
    };
    return queryObj;
  },

  findOne(query = {}) {
    return {
      then: function (resolve) {
        const match = memoryStore.messages.find((m) => {
          if (query._id && m._id.toString() !== query._id.toString()) return false;
          if (query.ticketId && m.ticketId.toString() !== query.ticketId.toString()) return false;
          return true;
        });
        resolve(match || null);
      },
    };
  },

  find(query = {}) {
    let shouldPopulate = false;
    const queryObj = {
      populate: function () {
        shouldPopulate = true;
        return queryObj;
      },
      sort: function () {
        return queryObj;
      },
      then: function (resolve) {
        let results = memoryStore.messages.filter(
          (m) => m.ticketId && m.ticketId.toString() === query.ticketId.toString()
        );
        results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (shouldPopulate) {
          results = results.map((m) => {
            const sender = memoryStore.users.find((u) => u._id.toString() === m.senderId.toString());
            return {
              ...m,
              senderId: sender
                ? { _id: sender._id, name: sender.name, email: sender.email, role: sender.role }
                : m.senderId,
            };
          });
        }
        resolve(results);
      },
    };
    return queryObj;
  },
};

// -------------------------------------------------------------
// COUNTER & TICKET NUMBER GENERATOR
// -------------------------------------------------------------
const MockCounter = {
  async findOneAndUpdate(query, update) {
    memoryStore.counters.ticketNumber += 1;
    const seq = memoryStore.counters.ticketNumber;
    return { _id: 'ticketNumber', seq };
  },
};

// -------------------------------------------------------------
// SEED IN-MEMORY STORE
// -------------------------------------------------------------
async function seedInMemoryStore() {
  if (memoryStore.users.length > 0) return;

  console.log('[In-Memory DB] Seeding default demo accounts and tickets...');

  const customerPass = await MockUser.hashPassword('Customer123!');
  const agentPass = await MockUser.hashPassword('Agent123!');
  const adminPass = await MockUser.hashPassword('Admin123!');

  const admin = await MockUser.create({
    name: 'Super Administrator',
    email: 'admin@supportflow.demo',
    passwordHash: adminPass,
    role: 'admin',
  });

  const agent = await MockUser.create({
    name: 'Sarah Support Agent',
    email: 'agent@supportflow.demo',
    passwordHash: agentPass,
    role: 'agent',
  });

  const customer = await MockUser.create({
    name: 'Alex Johnson',
    email: 'customer@supportflow.demo',
    passwordHash: customerPass,
    role: 'customer',
  });

  // Seed sample tickets
  const ticket1 = await MockTicket.create({
    ticketNumber: 'SF-000001',
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

  await MockMessage.create({
    ticketId: ticket1._id,
    senderId: customer._id,
    senderRole: 'customer',
    message: 'Hello, here is my invoice #INV-9821 with duplicate transaction IDs.',
  });

  await MockMessage.create({
    ticketId: ticket1._id,
    senderId: agent._id,
    senderRole: 'agent',
    message: 'Hi Alex, I have verified the transaction logs and initiated a refund of $49 back to your card.',
  });

  memoryStore.counters.ticketNumber = 1;

  console.log('✅ [In-Memory DB] Successfully initialized and seeded:');
  console.log('   - Admin:    admin@supportflow.demo    (Admin123!)');
  console.log('   - Agent:    agent@supportflow.demo    (Agent123!)');
  console.log('   - Customer: customer@supportflow.demo (Customer123!)');
}

module.exports = {
  memoryStore,
  MockUser,
  MockTicket,
  MockMessage,
  MockCounter,
  seedInMemoryStore,
};
