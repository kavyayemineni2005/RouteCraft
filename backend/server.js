const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database (MongoDB Atlas / Fallback)
connectDB();

const app = express();

// Allowed Origins for CORS across Production & Development
const allowedOrigins = [
  'https://route-craft-kappa.vercel.app',
  'https://routecraft-jdi6.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow exact matches, any Vercel domain (*.vercel.app), Render, or localhost
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    // Default: allow origin to prevent cross-domain blocking
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middlewares with high payload capacity for detailed route coordinates
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root Health & Deployment Verification Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RouteCraft Backend API Server is active and healthy',
    app: 'RouteCraft API',
    frontend: 'https://route-craft-kappa.vercel.app',
    backend: 'https://routecraft-jdi6.onrender.com',
    timestamp: new Date().toISOString(),
  });
});

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
