const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database (MongoDB Atlas / Fallback)
connectDB();

const app = express();

// Middlewares with high payload capacity for detailed route coordinates
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RouteCraft API is running',
    app: 'RouteCraft API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/route', require('./routes/routeRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/places', require('./routes/placeRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API route not found - ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[RouteCraft Server Error]:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[RouteCraft Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[RouteCraft Backend] Port ${PORT} is temporarily busy. Retrying in 1s...`);
    setTimeout(() => {
      try {
        server.close();
      } catch (e) {}
      server.listen(PORT);
    }, 1000);
  } else {
    console.error('[RouteCraft Server Error]:', err);
  }
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
