// models/BusinessCredit.js
const mongoose = require('mongoose');

const BusinessCreditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business', 
    required: true
  },
  credits: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  membershipLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one credit record per user-business pair
BusinessCreditSchema.index({ user: 1, business: 1 }, { unique: true });

// Method to add credits
BusinessCreditSchema.methods.addCredits = function(amount) {
  this.credits += amount;
  this.totalEarned += amount;
  this.lastActivity = new Date();
  this.updateMembershipLevel();
  return this.save();
};

// Method to spend credits
BusinessCreditSchema.methods.spendCredits = function(amount) {
  if (this.credits < amount) {
    throw new Error('Insufficient credits');
  }
  this.credits -= amount;
  this.totalSpent += amount;
  this.lastActivity = new Date();
  return this.save();
};

// Method to update membership level based on total earned
BusinessCreditSchema.methods.updateMembershipLevel = function() {
  if (this.totalEarned >= 1000) {
    this.membershipLevel = 'platinum';
  } else if (this.totalEarned >= 500) {
    this.membershipLevel = 'gold';
  } else if (this.totalEarned >= 200) {
    this.membershipLevel = 'silver';
  } else {
    this.membershipLevel = 'bronze';
  }
};

module.exports = mongoose.models.BusinessCredit || mongoose.model('BusinessCredit', BusinessCreditSchema);
