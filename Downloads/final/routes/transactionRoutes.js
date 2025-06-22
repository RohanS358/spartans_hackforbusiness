// routes/transactionRoutes.js
const express = require('express');
const { createTransaction, verifyTransaction, getMyTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createTransaction);
router.get('/', protect, getMyTransactions);
router.get('/verify/:hash', verifyTransaction);

module.exports = router;