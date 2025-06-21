const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const qrRoutes = require('./routes/qrRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Blockchain QR Transaction System running on port ${PORT}`);
  console.log('📋 Available Endpoints:');
  console.log('   POST /api/auth/register - Register new user');
  console.log('   POST /api/auth/login - User authentication');
  console.log('   POST /api/auth/associate-users - Associate users and create sub-account');
  console.log('   POST /api/wallet/create-wallet - Create new wallet');
  console.log('   POST /api/wallet/wallet-info - Get wallet information');
  console.log('   POST /api/wallet/add-funds - Add funds to wallet (testing)');
  console.log('   POST /api/transaction/create-transaction - Create regular transaction');
  console.log('   POST /api/transaction/verify-transaction - Verify regular transaction');
  console.log('   POST /api/qr/generate-qr-transaction - Generate QR code for transaction');
  console.log('   POST /api/qr/scan-qr-transaction - Scan and decrypt QR code');
  console.log('   POST /api/qr/execute-qr-transaction - Execute transaction from QR');
  console.log('   POST /api/qr/verify-qr-transaction - Verify transaction with dual keys');
  console.log('   GET  /api/qr/qr-transaction-status/:qrId - Get QR transaction status');
  console.log('   GET  /api/blockchain/blockchain-info - Get blockchain information');
  console.log('   GET  /api/blockchain/get-block/:index - Get specific block');
});