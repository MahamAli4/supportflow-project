const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO Connection Logic
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join ticket room for real-time ticket conversation updates
  socket.on('join_ticket', (ticketId) => {
    socket.join(`ticket:${ticketId}`);
    console.log(`[Socket.IO] Client ${socket.id} joined room: ticket:${ticketId}`);
  });

  // Leave ticket room
  socket.on('leave_ticket', (ticketId) => {
    socket.leave(`ticket:${ticketId}`);
    console.log(`[Socket.IO] Client ${socket.id} left room: ticket:${ticketId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Attach io instance to app for use in controllers if needed
app.set('io', io);

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[SupportFlow Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[SupportFlow Server Error] Failed to start server: ${error.message}`);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err);
});

if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };
