const express = require('express');
const {
  getBlockchain,
  createTransaction,
  minePendingTransactions,
  getBalance,
  validateChain,
  getStats,
  getBlocks,
  getBlock
} = require('../controllers/blockchainController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getBlockchain);
router.get('/stats', getStats);
router.get('/blocks', getBlocks);
router.get('/blocks/:index', getBlock);
router.post('/transactions', createTransaction);
router.post('/mine', minePendingTransactions);
router.get('/balance/:address', getBalance);
router.get('/validate', validateChain);

module.exports = router;