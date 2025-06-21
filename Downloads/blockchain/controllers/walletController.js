const WalletService = require('../services/walletService');
const TransactionService = require('../services/transactionService');

class WalletController {
  async createWallet(req, res) {
    try {
      const { userId, passkey } = req.body;
      const result = await WalletService.createWallet(userId, passkey);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getWalletInfo(req, res) {
    try {
      const { walletId, passkey } = req.body;
      const wallet = await WalletService.authenticateWallet(walletId, passkey);
      
      // Get transactions would be implemented in TransactionService
      const transactions = await Transaction.find({
        $or: [
          { fromWalletId: walletId },
          { toWalletId: walletId }
        ]
      });
      
      res.json({
        success: true,
        walletId: wallet.walletId,
        publicKey: wallet.publicKey,
        balance: wallet.balance,
        transactions
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async addFunds(req, res) {
    try {
      const { walletId, passkey, amount } = req.body;
      const wallet = await WalletService.authenticateWallet(walletId, passkey);
      const newBalance = wallet.balance + amount;
      await WalletService.updateWalletBalance(walletId, newBalance);
      
      res.json({
        success: true,
        newBalance,
        message: `Added ${amount} to wallet`
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new WalletController();