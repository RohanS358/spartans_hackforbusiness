const mongoose = require('mongoose');

const SubAccountSchema = new mongoose.Schema({
  subAccountId: {
    type: String,
    required: true,
    unique: true
  },
  subAccountPasskey: {
    type: String,
    required: true
  },
  associatedUsers: [{
    type: String,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  walletId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('SubAccount', SubAccountSchema);