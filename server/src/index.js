const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;
const USE_LOCAL = process.env.USE_LOCAL_API === 'true';

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);

// Only mount local API routes if using local DB
if (USE_LOCAL) {
  const medicalRouter = require('./routes/medical');
  app.use('/api/v1', medicalRouter);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    // Only connect to MySQL if using local API
    if (USE_LOCAL) {
      const sequelize = require('./config/database');
      await sequelize.authenticate();
      console.log('✅ Database connected.');
      await sequelize.sync({ alter: true });
      console.log('✅ Models synced.');
    } else {
      console.log('🌐 Using Odoo API (no local DB required).');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

