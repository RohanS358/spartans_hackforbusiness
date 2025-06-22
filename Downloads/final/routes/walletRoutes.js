// routes/walletRoutes.js
const express = require('express');
const { createWallet, getWallet, getWalletByAddress, transferTokens } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createWallet);
router.get('/', protect, getWallet);
router.get('/:address', getWalletByAddress);
router.post("/transfer", protect, transferTokens);

module.exports = router;