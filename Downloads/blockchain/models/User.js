const mongoose = require('mongoose');
const { ACCOUNT_TYPES } = require('../config/constants');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: Object.values(ACCOUNT_TYPES),
    default: ACCOUNT_TYPES.INDIVIDUAL
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  wallets: [{
    type: String
  }],
  associations: [{
    type: String
  }]
});

module.exports = mongoose.model('User', UserSchema);