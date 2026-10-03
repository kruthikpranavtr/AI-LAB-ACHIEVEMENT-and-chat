const mongoose = require('mongoose');

/**
 * Connect to MongoDB database via Mongoose
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_club_db';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.error('------------------------------------------------------------');
    console.error('TIP: Make sure MongoDB is running:');
    console.error('   1. Local Windows Service: Run "net start MongoDB" in Admin PowerShell');
    console.error('   2. Local MongoDB Executable: Run "mongod"');
    console.error('   3. Cloud MongoDB Atlas: Update MONGODB_URI in server/.env with your Atlas URI');
    console.error('------------------------------------------------------------');
    process.exit(1);
  }
};

module.exports = connectDB;
