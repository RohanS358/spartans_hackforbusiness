const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');

router.post('/create-wallet', WalletController.createWallet);
router.post('/wallet-info', WalletController.getWalletInfo);
router.post('/add-funds', WalletController.addFunds);

module.exports = router;