const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  transactions: [{
    hash: String,
    fromAddress: String,
    toAddress: String,
    amount: Number,
    data: Object,
    timestamp: Date,
    signature: String
  }],
  previousHash: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  nonce: {
    type: Number,
    default: 0
  },
  miner: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Block', BlockSchema);
