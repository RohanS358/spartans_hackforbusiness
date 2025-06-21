const User = require('../models/User');
const Wallet = require('../models/Wallet');
const CryptoService = require('./cryptoService');

class WalletService {
  constructor() {
    this.keyPairs = {}; // In-memory storage for key pairs
  }

  async createWallet(userId, walletPasskey) {
    const walletId = CryptoService.hash(userId + Date.now());
    const hashedPasskey = CryptoService.hash(walletPasskey);
    
    const keyPair = await CryptoService.generateKeyPair(walletId, hashedPasskey);
    
    const wallet = new Wallet({
      walletId,
      userId,
      hashedPasskey,
      publicKey: keyPair.publicKey,
      balance: 0,
      transactions: []
    });
    
    await wallet.save();
    this.keyPairs[walletId] = keyPair;
    
    // Update user's wallets list
    await User.updateOne(
      { userId },
      { $push: { wallets: walletId } }
    );
    
    return {
      walletId,
      publicKey: keyPair.publicKey
    };
  }

  async createSubAccountWallet(subAccount) {
    const hashedPasskey = CryptoService.hash(subAccount.subAccountPasskey);
    const keyPair = await CryptoService.generateKeyPair(subAccount.walletId, hashedPasskey);
    
    const wallet = new Wallet({
      walletId: subAccount.walletId,
      userId: subAccount.subAccountId, // Use sub-account ID as user ID
      hashedPasskey,
      publicKey: keyPair.publicKey,
      balance: 0,
      transactions: []
    });
    
    await wallet.save();
    this.keyPairs[subAccount.walletId] = keyPair;
    
    return {
      walletId: subAccount.walletId,
      publicKey: keyPair.publicKey
    };
  }

  async authenticateWallet(walletId, passkey) {
    const wallet = await Wallet.findOne({ walletId });
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    const hashedPasskey = CryptoService.hash(passkey);
    if (wallet.hashedPasskey !== hashedPasskey) {
      throw new Error('Invalid wallet passkey');
    }
    
    return wallet;
  }

  async getPrivateKey(walletId, passkey = null) {
    if (passkey) {
      await this.authenticateWallet(walletId, passkey);
    }
    
    if (!this.keyPairs[walletId]) {
      // Regenerate key pair if not in memory
      const wallet = await Wallet.findOne({ walletId });
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      const keyPair = await CryptoService.generateKeyPair(walletId, wallet.hashedPasskey);
      this.keyPairs[walletId] = keyPair;
    }
    
    return this.keyPairs[walletId].privateKey;
  }

  async getSubAccountPrivateKey(subAccountId) {
    const subAccount = await SubAccount.findOne({ subAccountId });
    if (!subAccount) {
      throw new Error('Sub-account not found');
    }
    
    return this.getPrivateKey(subAccount.walletId);
  }

  async updateWalletBalance(walletId, newBalance) {
    await Wallet.updateOne(
      { walletId },
      { $set: { balance: newBalance } }
    );
  }

  async addTransactionToWallet(walletId, txId) {
    await Wallet.updateOne(
      { walletId },
      { $push: { transactions: txId } }
    );
  }
}

module.exports = new WalletService();