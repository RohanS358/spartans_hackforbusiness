// models/Wallet.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const WalletSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'ownerModel',
    required: true
  },
  ownerModel: {
    type: String,
    required: true,
    enum: ['User', 'Business']
  },
  address: {
    type: String,
    unique: true,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate wallet address from owner ID and private key
WalletSchema.statics.generateWalletAddress = function(ownerId, privateKey) {
  return crypto
    .createHash('sha256')
    .update(`${privateKey}${ownerId}`)
    .digest('hex');
};

module.exports = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);