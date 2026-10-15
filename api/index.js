const app = require('../Back-end/app');
const connectDB = require('../Back-end/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in Vercel function:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to database. Make sure MONGO_URI is configured in Vercel Environment Variables.',
      error: err.message,
    });
  }

  return app(req, res);
};
