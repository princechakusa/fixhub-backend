const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');   // <-- added

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);                  // <-- added

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