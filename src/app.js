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
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
