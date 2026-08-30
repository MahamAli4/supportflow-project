const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { seedData } = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

async function startDevServer() {
  console.log('[Dev Host] Starting SupportFlow in-memory live backend server...');

  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`[Dev Host DB] In-Memory MongoDB Connected: ${mongoUri}`);

    // Seed default demo accounts
    await seedData();

    // Create HTTP Server & Socket.IO
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH'],
      },
    });

    io.on('connection', (socket) => {
      console.log(`[Socket.IO Dev Host] Client connected: ${socket.id}`);

      socket.on('join_ticket', (ticketId) => {
        socket.join(`ticket:${ticketId}`);
        console.log(`[Socket.IO Dev Host] Joined room ticket:${ticketId}`);
      });

      socket.on('leave_ticket', (ticketId) => {
        socket.leave(`ticket:${ticketId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO Dev Host] Client disconnected: ${socket.id}`);
      });
    });

    app.set('io', io);

    server.listen(PORT, () => {
      console.log('\n===============================================================');
      console.log(`🚀 SUPPORTFLOW LIVE BACKEND SERVER IS RUNNING ON PORT ${PORT}`);
      console.log(`👉 API Base URL: http://localhost:${PORT}/api`);
      console.log(`👉 Socket.IO URL: http://localhost:${PORT}`);
      console.log('===============================================================\n');
    });
  } catch (error) {
    console.error('[Dev Host Error]', error);
    process.exit(1);
  }
}

startDevServer();
