const TransactionService = require('../services/transactionService');
const WalletService = require('../services/walletService');

class TransactionController {
  async createTransaction(req, res) {
    try {
      const { fromWalletId, toWalletId, amount, senderPasskey } = req.body;
      
      const privateKey = await WalletService.getPrivateKey(fromWalletId, senderPasskey);
      
      const transaction = await TransactionService.createTransaction(
        fromWalletId,
        toWalletId,
        amount,
        privateKey
      );
      
      res.json({
        success: true,
        transactionId: transaction.txId,
        status: transaction.status
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async verifyTransaction(req, res) {
    try {
      const { transactionId, receiverPublicKey } = req.body;
      const result = await TransactionService.verifyAndConfirmTransaction(
        transactionId,
        receiverPublicKey
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new TransactionController();