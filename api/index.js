const app = require('../server/app');
const { connectDB } = require('../server/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless DB Error]', err.message);
    }
  }
  return app(req, res);
};
