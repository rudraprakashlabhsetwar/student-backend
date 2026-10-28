require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // DNS fallback resolution for MongoDB Atlas SRV

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');

// Connect to Database with Connection Pooling
connectDB();

const app = express();

// Trust reverse proxy (Render load balancer / Cloudflare)
app.set('trust proxy', 1);

// CORS Configuration supporting CORS_ORIGIN environment variable
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['https://student-frontend-ruddy.vercel.app', 'http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, MCP server, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body Parser Middleware (Stateless JSON API)
app.use(express.json());

// Health Check Route (Used by Render & monitoring services)
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isDbConnected = dbState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbState] || 'unknown',
    service: process.env.RENDER_SERVICE_NAME || 'student-api',
    hasMongoUri: Boolean(process.env.MONGODB_URI),
  });
});

// Root Information Route
app.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    success: true,
    message: 'Student API is running!',
    service: process.env.RENDER_SERVICE_NAME || 'student-api',
    database: dbState === 1 ? 'connected' : 'disconnected (set MONGODB_URI in Render Dashboard -> Environment)',
    healthCheck: '/health',
  });
});

// API Routes
app.use('/api/students', studentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server (Binds to 0.0.0.0 for Docker container routing)
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
});

// Graceful Shutdown for Stateless Load Balancing
const gracefulShutdown = (signal) => {
  console.log(`🛑 Received ${signal}. Closing HTTP server and database connection gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
