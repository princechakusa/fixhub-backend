const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const pool = require('./config/db');

app.get('/api/env-test', (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    urlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'missing'
  });
});

module.exports = app;