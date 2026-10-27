require('dotenv').config();
/*const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // DNS issue fix karne ke liye*/

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Student API is running perfectly!' 
  });
});

// API Routes
app.use('/api/students', studentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});