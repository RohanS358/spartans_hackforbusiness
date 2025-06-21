const mongoose = require('mongoose');
const { QR_STATUS } = require('../config/constants');

const QRTransactionSchema = new mongoose.Schema({
  qrId: {
    type: String,
    required: true,
    unique: true
  },
  senderWalletId: {
    type: String,
    required: true
  },
  subAccountId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  qrData: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(QR_STATUS),
    default: QR_STATUS.GENERATED
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scannedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  receiverWalletId: {
    type: String
  },
  transactionId: {
    type: String
  }
});

module.exports = mongoose.model('QRTransaction', QRTransactionSchema);