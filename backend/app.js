// app.js
// This file creates the Express application and connects all routes.
// server.js starts the app; tests import this file directly.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const recordRoutes = require('./routes/recordRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ---------- Global middleware ----------
app.use(helmet()); // adds basic security HTTP headers

// Allow the React app to call this API.
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl.split(',').map((url) => url.trim()),
  })
);

app.use(express.json()); // parse JSON request bodies

// ---------- Simple health check ----------
app.get('/api/health', (req, res) => {
  res.json({ message: 'PawHaven API is running.', time: new Date().toISOString() });
});

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stats', statsRoutes);

// ---------- Error handling ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
