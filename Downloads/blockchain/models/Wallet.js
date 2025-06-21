const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  walletId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  hashedPasskey: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  transactions: [{
    type: String
  }]
});

module.exports = mongoose.model('Wallet', WalletSchema);