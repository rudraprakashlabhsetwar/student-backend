const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,                 // Maintain up to 10 socket connections per instance
      minPoolSize: 2,                  // Maintain a minimum of 2 socket connections for rapid response
      socketTimeoutMS: 45000,          // Close inactive sockets after 45 seconds
      serverSelectionTimeoutMS: 5000,  // Keep trying to send operations for 5 seconds
      family: 4                        // Use IPv4 to avoid IPv6 resolution delays
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

module.exports = connectDB;
