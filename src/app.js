const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Configure helmet to allow inline scripts and styles
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://fixhub-db.onrender.com"],
    },
  },
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// Health and test endpoints
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const pool = require('./config/db');
app.get('/api/env-test', (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    urlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'missing'
  });
});

// Catch-all to serve index.html for client-side routing (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

module.exports = app;
