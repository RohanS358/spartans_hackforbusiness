module.exports = {
  BLOCKCHAIN: {
    DIFFICULTY: 2,
    GENESIS_BLOCK: {
      index: 0,
      previousHash: '0',
      timestamp: Date.now(),
      transactions: [],
      nonce: 0
    }
  },
  QR: {
    ENCRYPTION_PREFIX: 'encryption_key'
  },
  ACCOUNT_TYPES: {
    INDIVIDUAL: 'individual',
    BUSINESS: 'business'
  },
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FAILED: 'failed'
  },
  QR_STATUS: {
    GENERATED: 'generated',
    SCANNED: 'scanned',
    COMPLETED: 'completed',
    VERIFIED: 'verified'
  }
};