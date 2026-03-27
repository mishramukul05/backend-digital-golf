require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({ 
  origin: true, 
  credentials: true 
}));
app.use(cookieParser());

// Stripe Webhook needs raw body, so it must be configured before express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }), require('./routes/paymentWebhook'));

// This must come AFTER the webhook route
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      serverSelectionTimeoutMS: 5000 
    });
    console.log('✅ MongoDB Connected successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error: ', err);
  }
};
connectDB();

// Routes
app.use('/api/scores', require('./routes/scores'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/draws', require('./routes/draws'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/charities', require('./routes/charities'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('Digital Heroes Golf Charity API is running...');
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
