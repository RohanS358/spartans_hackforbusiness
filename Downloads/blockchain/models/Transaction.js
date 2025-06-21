const mongoose = require('mongoose');
const { TRANSACTION_STATUS } = require('../config/constants');

const TransactionSchema = new mongoose.Schema({
  txId: {
    type: String,
    required: true,
    unique: true
  },
  fromWalletId: {
    type: String,
    required: true
  },
  toWalletId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  signature: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TRANSACTION_STATUS),
    default: TRANSACTION_STATUS.PENDING
  },
  blockHash: {
    type: String
  },
  qrId: {
    type: String
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);