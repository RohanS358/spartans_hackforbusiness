const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const WalletService = require('./walletService');
const CryptoService = require('./cryptoService');
const BlockchainService = require('./blockchainService');

class TransactionService {
  async createTransaction(fromWalletId, toWalletId, amount, privateKey, qrId = null) {
    const fromWallet = await Wallet.findOne({ walletId: fromWalletId });
    const toWallet = await Wallet.findOne({ walletId: toWalletId });
    
    if (!fromWallet || !toWallet) {
      throw new Error('Invalid wallet(s)');
    }
    
    if (fromWallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create signature
    const message = fromWalletId + toWalletId + amount.toString();
    const signature = CryptoService.sign(message, privateKey);
    
    // Create transaction
    const txId = CryptoService.hash(fromWalletId + toWalletId + amount.toString() + Date.now());
    const transaction = new Transaction({
      txId,
      fromWalletId,
      toWalletId,
      amount,
      signature,
      status: 'pending',
      qrId
    });
    
    await transaction.save();
    return transaction;
  }

  async verifyAndConfirmTransaction(txId, receiverPublicKey) {
    const transaction = await Transaction.findOne({ txId });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    if (transaction.status !== 'pending') {
      throw new Error('Transaction already processed');
    }
    
    // Get sender wallet and verify signature
    const fromWallet = await Wallet.findOne({ walletId: transaction.fromWalletId });
    const message = transaction.fromWalletId + transaction.toWalletId + transaction.amount.toString();
    const isValid = CryptoService.verify(message, transaction.signature, fromWallet.publicKey);
    
    if (!isValid) {
      await Transaction.updateOne({ txId }, { $set: { status: 'failed' } });
      throw new Error('Invalid transaction signature');
    }
    
    // Verify receiver public key matches
    const toWallet = await Wallet.findOne({ walletId: transaction.toWalletId });
    if (toWallet.publicKey !== receiverPublicKey) {
      await Transaction.updateOne({ txId }, { $set: { status: 'failed' } });
      throw new Error('Receiver public key mismatch');
    }
    
    // Update balances
    const newFromBalance = fromWallet.balance - transaction.amount;
    const newToBalance = toWallet.balance + transaction.amount;
    
    await WalletService.updateWalletBalance(transaction.fromWalletId, newFromBalance);
    await WalletService.updateWalletBalance(transaction.toWalletId, newToBalance);
    
    // Add transaction to wallet histories
    await WalletService.addTransactionToWallet(transaction.fromWalletId, txId);
    await WalletService.addTransactionToWallet(transaction.toWalletId, txId);
    
    // Mine block
    const block = await BlockchainService.mineBlock([transaction]);
    
    return {
      success: true,
      transaction,
      block,
      verification: 'Both sender and receiver keys verified'
    };
  }
}

module.exports = new TransactionService();