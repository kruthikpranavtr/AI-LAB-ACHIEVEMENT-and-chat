require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Initialize Database Connection and Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Listen on configured port
    app.listen(PORT, () => {
      console.log('===========================================================');
      console.log(`🚀 AI CLUB BACKEND SERVER RUNNING`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/v1/auth`);
      console.log(`   - POST /api/v1/auth/register`);
      console.log(`   - POST /api/v1/auth/login`);
      console.log(`   - GET  /api/v1/auth/me`);
      console.log(`   - POST /api/v1/auth/logout`);
      console.log(`📬 Contact Endpoint: http://localhost:${PORT}/api/v1/contact`);
      console.log(`   - POST /api/v1/contact`);
      console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log('===========================================================');
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
