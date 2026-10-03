const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// 1. Security Headers via Helmet
app.use(helmet());

// 2. CORS configuration: allows requests from client frontend
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5500';

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from localhost, 127.0.0.1, CLIENT_URL, or direct file:/// requests (null origin)
      if (
        !origin ||
        origin === 'null' ||
        origin === clientUrl ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Club API is running',
  });
});

// 5. Auth API Routes
app.use('/api/v1/auth', authRoutes);

// 6. Contact API Routes
app.use('/api/v1/contact', contactRoutes);

// 7. Projects API Routes
app.use('/api/v1/projects', projectRoutes);

// 7. 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
