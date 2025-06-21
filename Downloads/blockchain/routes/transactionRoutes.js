const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');

router.post('/create-transaction', TransactionController.createTransaction);
router.post('/verify-transaction', TransactionController.verifyTransaction);

module.exports = router;