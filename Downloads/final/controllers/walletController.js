// controllers/walletController.js
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Business = require('../models/Business');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');

// @desc    Create wallet for user or business
// @route   POST /api/wallet
// @access  Private
exports.createWallet = async (req, res, next) => {
  try {
    const { privateKey } = req.body;
    const { id, role } = req.user;
     
    // Check if wallet already exists
    const existingWallet = await Wallet.findOne({ 
      owner: id,
      ownerModel: role === 'business' ? 'Business' : 'User' 
    });
    
    if (existingWallet) {
      return next(new ErrorResponse('Wallet already exists for this account', 400));
    }
    
    if (!privateKey) {
      return next(new ErrorResponse('Private key is required', 400));
    }
    
    // Generate wallet address
    const address = Wallet.generateWalletAddress(id, privateKey);
    
    // Create wallet
    const wallet = await Wallet.create({
      owner: id,
      ownerModel: role === 'business' ? 'Business' : 'User',
      address,
      balance: 100 // Starting with 100 tokens for testing
    });
    
    res.status(201).json({
      success: true,
      data: {
        address: wallet.address,
        balance: wallet.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wallet for current user or business
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    
    const wallet = await Wallet.findOne({ 
      owner: id,
      ownerModel: role === 'business' ? 'Business' : 'User' 
    });
    
    if (!wallet) {
      return next(new ErrorResponse('No wallet found for this account', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        address: wallet.address,
        balance: wallet.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wallet by address
// @route   GET /api/wallet/:address
// @access  Public
exports.getWalletByAddress = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ address: req.params.address });
    
    if (!wallet) {
      return next(new ErrorResponse('Wallet not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: {
        address: wallet.address,
        balance: wallet.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer tokens between wallets
// @route   POST /api/wallet/transfer
// @access  Private
exports.transferTokens = async (req, res, next) => {
    try {
        const { recipientAddress, amount, qrCode } = req.body;
        const { id, role } = req.user;
        
        // Validation
        if (!amount) {
            return next(new ErrorResponse('Amount is required', 400));
        }
        
        if (!recipientAddress && !qrCode) {
            return next(new ErrorResponse('Either recipient address or QR code is required', 400));
        }
        
        if (amount <= 0) {
            return next(new ErrorResponse('Amount must be greater than 0', 400));
        }
        
        // Get sender wallet
        const senderWallet = await Wallet.findOne({
            owner: id,
            ownerModel: role === 'business' ? 'Business' : 'User'
        });
        
        if (!senderWallet) {
            return next(new ErrorResponse('Sender wallet not found', 404));
        }
        
        // Check sufficient balance
        if (senderWallet.balance < amount) {
            return next(new ErrorResponse('Insufficient balance', 400));
        }
        
        // Determine recipient address
        let finalRecipientAddress = recipientAddress;
        
        // If QR code is provided, decode it to get the address
        if (qrCode) {
            try {
                // Assuming QR code contains JSON with wallet address
                const qrData = JSON.parse(qrCode);
                finalRecipientAddress = qrData.address || qrData.walletAddress;
                
                if (!finalRecipientAddress) {
                    return next(new ErrorResponse('Invalid QR code format', 400));
                }
            } catch (parseError) {
                // If not JSON, assume QR code directly contains the address
                finalRecipientAddress = qrCode;
            }
        }
        
        // Validate recipient address format
        if (!finalRecipientAddress || finalRecipientAddress.length < 10) {
            return next(new ErrorResponse('Invalid recipient address', 400));
        }
        
        // Get recipient wallet
        const recipientWallet = await Wallet.findOne({ address: finalRecipientAddress });
        if (!recipientWallet) {
            return next(new ErrorResponse('Recipient wallet not found', 404));
        }
        
        // Prevent self-transfer
        if (senderWallet.address === recipientWallet.address) {
            return next(new ErrorResponse('Cannot transfer to your own wallet', 400));
        }
        
        // Perform transfer
        senderWallet.balance -= amount;
        recipientWallet.balance += amount;
        
        await senderWallet.save();
        await recipientWallet.save();
          res.status(200).json({
            success: true,
            message: 'Transfer completed successfully',
            data: {
                from: senderWallet.address,
                to: recipientWallet.address,
                amount,
                senderNewBalance: senderWallet.balance,
                transactionId: crypto.randomBytes(16).toString('hex')
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    List all wallets (for debugging)
// @route   GET /api/wallet/all
// @access  Private (admin)
exports.getAllWallets = async (req, res, next) => {
  try {
    const wallets = await Wallet.find({})
      .select('address balance owner ownerModel createdAt');
    
    // Manually populate owner data based on ownerModel
    const enrichedWallets = await Promise.all(wallets.map(async (wallet) => {
      let ownerData = null;
      
      try {
        if (wallet.ownerModel === 'User') {
          const User = require('../models/User');
          ownerData = await User.findById(wallet.owner).select('name email');
        } else if (wallet.ownerModel === 'Business') {
          const Business = require('../models/Business');
          ownerData = await Business.findById(wallet.owner).select('name email');
        }
      } catch (error) {
        console.log('Error populating wallet owner:', error.message);
      }
      
      return {
        address: wallet.address,
        balance: wallet.balance,
        ownerModel: wallet.ownerModel,
        owner: ownerData || { name: 'Unknown', email: 'Unknown' },
        createdAt: wallet.createdAt
      };
    }));
    
    res.status(200).json({
      success: true,
      count: enrichedWallets.length,
      data: enrichedWallets
    });
  } catch (error) {
    next(error);
  }
};