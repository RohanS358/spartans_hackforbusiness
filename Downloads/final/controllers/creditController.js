// controllers/creditController.js
const BusinessCredit = require('../models/BusinessCredit');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Purchase credits for a specific business
// @route   POST /api/credits/purchase
// @access  Private
exports.purchaseCredits = async (req, res, next) => {
  try {
    const { businessId, creditPackageId, encryptedPrivateKey } = req.body;
    const { id: userId } = req.user;

    // Get the credit package (product)
    const creditPackage = await Product.findById(creditPackageId);
    if (!creditPackage || creditPackage.type !== 'credit_package') {
      return next(new ErrorResponse('Credit package not found', 404));
    }

    // Verify business
    const business = await Business.findById(businessId);
    if (!business) {
      return next(new ErrorResponse('Business not found', 404));
    }

    // Get user and business wallets
    const userWallet = await Wallet.findOne({ owner: userId, ownerModel: 'User' });
    const businessWallet = await Wallet.findOne({ owner: businessId, ownerModel: 'Business' });

    if (!userWallet) {
      return next(new ErrorResponse('User wallet not found', 404));
    }
    if (!businessWallet) {
      return next(new ErrorResponse('Business wallet not found', 404));
    }

    // Check if user has sufficient balance
    if (userWallet.balance < creditPackage.price) {
      return next(new ErrorResponse('Insufficient wallet balance', 400));
    }

    // Process wallet transaction
    userWallet.balance -= creditPackage.price;
    businessWallet.balance += creditPackage.price;
    await userWallet.save();
    await businessWallet.save();

    // Create transaction record
    const crypto = require('crypto');
    const transactionHash = crypto.createHash('sha256')
      .update(`${userWallet.address}${businessWallet.address}${creditPackage.price}${Date.now()}`)
      .digest('hex');

    const transaction = await Transaction.create({
      hash: transactionHash,
      fromAddress: userWallet.address,
      toAddress: businessWallet.address,
      fromId: userWallet._id,
      toId: businessWallet._id,
      amount: creditPackage.price,
      product: creditPackageId,
      data: {
        type: 'credit_purchase',
        businessId,
        creditValue: creditPackage.creditValue
      },
      status: 'completed'
    });

    // Add credits to user's business credit account
    let businessCredit = await BusinessCredit.findOne({ user: userId, business: businessId });
    
    if (!businessCredit) {
      businessCredit = await BusinessCredit.create({
        user: userId,
        business: businessId,
        credits: creditPackage.creditValue,
        totalEarned: creditPackage.creditValue
      });
    } else {
      await businessCredit.addCredits(creditPackage.creditValue);
    }

    res.status(201).json({
      success: true,
      data: {
        transaction: {
          hash: transaction.hash,
          amount: creditPackage.price,
          creditsEarned: creditPackage.creditValue
        },
        businessCredit: {
          credits: businessCredit.credits,
          membershipLevel: businessCredit.membershipLevel,
          totalEarned: businessCredit.totalEarned
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Use credits for a purchase
// @route   POST /api/credits/spend
// @access  Private
exports.spendCredits = async (req, res, next) => {
  try {
    const { businessId, productId, creditsToSpend } = req.body;
    const { id: userId } = req.user;

    // Get user's business credit account
    const businessCredit = await BusinessCredit.findOne({ user: userId, business: businessId });
    
    if (!businessCredit) {
      return next(new ErrorResponse('No credit account found for this business', 404));
    }

    if (businessCredit.credits < creditsToSpend) {
      return next(new ErrorResponse('Insufficient credits', 400));
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Spend credits
    await businessCredit.spendCredits(creditsToSpend);

    // Create transaction record for credit spending
    const crypto = require('crypto');
    const transactionHash = crypto.createHash('sha256')
      .update(`credit_spend_${userId}_${businessId}_${creditsToSpend}_${Date.now()}`)
      .digest('hex');

    const transaction = await Transaction.create({
      hash: transactionHash,
      fromAddress: 'CREDIT_ACCOUNT',
      toAddress: 'BUSINESS_CREDIT',
      amount: creditsToSpend,
      product: productId,
      data: {
        type: 'credit_spend',
        userId,
        businessId,
        productName: product.name
      },
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        transaction: {
          hash: transaction.hash,
          creditsSpent: creditsToSpend,
          product: product.name
        },
        remainingCredits: businessCredit.credits,
        membershipLevel: businessCredit.membershipLevel
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user's credits for all businesses
// @route   GET /api/credits
// @access  Private
exports.getUserCredits = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const credits = await BusinessCredit.find({ user: userId })
      .populate('business', 'name businessType location')
      .sort('-lastActivity');

    res.status(200).json({
      success: true,
      count: credits.length,
      data: credits
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user's credits for specific business
// @route   GET /api/credits/business/:businessId
// @access  Private
exports.getBusinessCredits = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { id: userId } = req.user;

    const businessCredit = await BusinessCredit.findOne({ 
      user: userId, 
      business: businessId 
    }).populate('business', 'name businessType');

    if (!businessCredit) {
      return next(new ErrorResponse('No credit account found for this business', 404));
    }

    res.status(200).json({
      success: true,
      data: businessCredit
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  purchaseCredits: exports.purchaseCredits,
  spendCredits: exports.spendCredits,
  getUserCredits: exports.getUserCredits,
  getBusinessCredits: exports.getBusinessCredits
};
