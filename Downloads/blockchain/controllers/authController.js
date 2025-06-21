const User = require('../models/User');
const SubAccount = require('../models/SubAccount');
const WalletService = require('../services/walletService');
const CryptoService = require('../services/cryptoService');
const { ACCOUNT_TYPES } = require('../config/constants');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, accountType = ACCOUNT_TYPES.INDIVIDUAL } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }
      
      const hashedPassword = await CryptoService.hashPassword(password);
      const userId = await CryptoService.hash(email + Date.now());


      
      const user = new User({
        userId,
        email,
        password: hashedPassword,
        accountType,
        wallets: [],
        associations: []
      });
      
      await user.save();
      
      res.json({ success: true, userId, accountType });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }
      
      const isMatch = await CryptoService.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      
      res.json({
        success: true,
        userId: user.userId,
        email: user.email,
        accountType: user.accountType,
        wallets: user.wallets,
        associations: user.associations
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async associateUsers(req, res) {
    try {
      const { user1Id, user2Id } = req.body;
      
      const user1 = await User.findOne({ userId: user1Id });
      const user2 = await User.findOne({ userId: user2Id });
      
      if (!user1 || !user2) {
        return res.status(404).json({ success: false, error: 'One or both users not found' });
      }
      
      // Update associations
      if (!user1.associations.includes(user2Id)) {
        user1.associations.push(user2Id);
        await user1.save();
      }
      
      if (!user2.associations.includes(user1Id)) {
        user2.associations.push(user1Id);
        await user2.save();
      }
      
      // Create sub-account
      const subAccountId = CryptoService.hash(user1Id + user2Id + Date.now());
      const subAccountPasskey = CryptoService.hash(subAccountId + 'passkey');
      const walletId = CryptoService.hash(subAccountId + Date.now() + 'wallet');
      
      const subAccount = new SubAccount({
        subAccountId,
        subAccountPasskey,
        associatedUsers: [user1Id, user2Id],
        walletId
      });
      
      await subAccount.save();
      
      // Create wallet for sub-account
      const walletInfo = await WalletService.createSubAccountWallet(subAccount);
      
      res.json({
        success: true,
        subAccountId,
        walletId: walletInfo.walletId,
        publicKey: walletInfo.publicKey
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AuthController();