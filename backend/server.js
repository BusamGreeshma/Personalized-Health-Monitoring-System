const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables immediately
dotenv.config();

const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const aiRoutes = require('./routes/aiRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading local uploads from React
}));
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Static Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);

// General Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Personalized Health Monitoring API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in mode on port ${PORT}`);
  });
}

module.exports = app;
