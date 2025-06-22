// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional reference to product if this is a purchase
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // QR code for transaction verification
  qrCode: {
    type: String
  }
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);