const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || typeof uri !== 'string' || uri.trim() === '') {
    console.error('❌ MONGODB_URI environment variable is missing or undefined!');
    console.error('👉 Fix: Go to your Render Dashboard -> Select your service (studentRudra / student-api) -> Environment -> Add MONGODB_URI');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri.trim(), {
      maxPoolSize: 10,                 // Maintain up to 10 socket connections per instance
      minPoolSize: 2,                  // Maintain a minimum of 2 socket connections for rapid response
      socketTimeoutMS: 45000,          // Close inactive sockets after 45 seconds
      serverSelectionTimeoutMS: 5000,  // Keep trying to send operations for 5 seconds
      family: 4                        // Use IPv4 to avoid IPv6 resolution delays
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Check that:');
    console.error('   1. MONGODB_URI in Render contains the correct username, password, and database.');
    console.error('   2. MongoDB Atlas -> Network Access allows 0.0.0.0/0 (Render dynamic IPs).');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

module.exports = connectDB;
