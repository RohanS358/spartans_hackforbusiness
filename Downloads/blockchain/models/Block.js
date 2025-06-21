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
    type: String
  }],
  previousHash: {
    type: String,
    required: true
  },
  nonce: {
    type: Number,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('Block', BlockSchema);