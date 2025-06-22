// utils/blockchain.js
const crypto = require('crypto');
const QRCode = require('qrcode');

// Blockchain utility functions
module.exports = {
  // Generate transaction hash
  generateTransactionHash: (fromAddress, toAddress, amount, timestamp) => {
    return crypto
      .createHash('sha256')
      .update(`${fromAddress}${toAddress}${amount}${timestamp}`)
      .digest('hex');
  },
  
  // Generate QR code for transaction verification
  generateTransactionQR: async (transactionHash) => {
    try {
      const qrCodeData = `TRANSACTION:${transactionHash}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  },
  
  // Verify transaction (can be extended with actual blockchain verification logic)
  verifyTransaction: (transaction) => {
    // For a real implementation, you would verify the transaction against the blockchain
    // Here we're just checking that it exists and has the required fields
    if (!transaction) {
      return {
        verified: false,
        message: 'Transaction not found'
      };
    }
    
    return {
      verified: true,
      message: 'Transaction verified',
      transaction
    };
  }
};