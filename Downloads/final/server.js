// server.js - Main entry point
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const blockchainRoutes = require('./routes/blockchainRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/business', require('./routes/businessRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/credits', require('./routes/creditRoutes'));
app.use('/api/blockchain', blockchainRoutes)

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));