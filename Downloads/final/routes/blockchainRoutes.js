const express = require('express');
const {
  getBlockchain,
  createTransaction,
  minePendingTransactions,
  getBalance,
  validateChain
} = require('../controllers/blockchainController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getBlockchain);
router.post('/transactions', protect, createTransaction);
router.post('/mine', protect, minePendingTransactions);
router.get('/balance/:address', getBalance);
router.get('/validate', validateChain);

module.exports = router;