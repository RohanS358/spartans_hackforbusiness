const express = require('express');
const router = express.Router();
const BlockchainController = require('../controllers/blockchainController');

router.get('/blockchain-info', BlockchainController.getBlockchainInfo);
router.get('/get-block/:index', BlockchainController.getBlock);

module.exports = router;