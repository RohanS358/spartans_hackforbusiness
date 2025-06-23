// routes/transactionRoutes.js
const express = require('express');
const {
  createTransaction,
  getMyTransactions,
  getTransactionsByWallet,
  verifyTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/transactions - Create a new transaction
router.post('/', protect, createTransaction);

// GET /api/transactions - Get current user's transactions
router.get('/', protect, getMyTransactions);

// GET /api/transactions/wallet/:walletId - Get transactions by wallet
router.get('/wallet/:walletId', protect, getTransactionsByWallet);

// GET /api/transactions/verify/:hash - Verify a transaction
router.get('/verify/:hash', verifyTransaction);

module.exports = router;