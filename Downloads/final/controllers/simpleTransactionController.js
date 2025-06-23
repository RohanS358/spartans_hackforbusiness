const Transaction = require('../models/transaction');
const Wallet = require('../models/Wallet');
const Block = require('../models/Block');
const User = require('../models/User');
const Business = require('../models/Business');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const { toId, amount, description, type = 'transfer' } = req.body;
    const fromUserId = req.user.id;
    const userModel = req.user.role === 'business' ? 'Business' : 'User';

    // Validate input
    if (!toId || !amount || amount <= 0) {
      return next(new ErrorResponse('Please provide valid recipient and amount', 400));
    }

    // Get sender's wallet
    const fromWallet = await Wallet.findOne({ 
      owner: fromUserId,
      ownerModel: userModel
    });

    if (!fromWallet) {
      return next(new ErrorResponse('Sender wallet not found. Please create a wallet first.', 404));
    }

    // Get recipient's wallet
    const toWallet = await Wallet.findOne({ 
      owner: toId
    });

    if (!toWallet) {
      return next(new ErrorResponse('Recipient wallet not found', 404));
    }

    // Check sufficient balance
    if (fromWallet.balance < amount) {
      return next(new ErrorResponse('Insufficient balance', 400));
    }

    // Create transaction hash
    const transactionHash = crypto.createHash('sha256')
      .update(fromWallet.address + toWallet.address + amount + Date.now())
      .digest('hex');

    // Create transaction record
    const transaction = await Transaction.create({
      fromId: fromUserId,
      toId: toId,
      fromAddress: fromWallet.address,
      toAddress: toWallet.address,
      amount: amount,
      description: description || `${type} transaction`,
      type: type,
      hash: transactionHash,
      status: 'pending',
      confirmations: 0
    });

    // Update wallet balances
    fromWallet.balance -= amount;
    toWallet.balance += amount;
    
    await fromWallet.save();
    await toWallet.save();

    // Add to blockchain
    await addTransactionToBlockchain({
      hash: transactionHash,
      fromAddress: fromWallet.address,
      toAddress: toWallet.address,
      amount: amount,
      data: { description, type, transactionId: transaction._id },
      timestamp: new Date(),
      signature: `sig_${transactionHash.slice(0, 16)}`
    });

    // Mark transaction as completed
    transaction.status = 'completed';
    transaction.confirmations = 6;
    await transaction.save();

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction completed successfully'
    });

  } catch (error) {
    console.error('Transaction error:', error);
    next(error);
  }
};

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get transactions where user is sender or receiver
    const transactions = await Transaction.find({
      $or: [
        { fromId: userId },
        { toId: userId }
      ]
    })
    .populate('fromId', 'name email')
    .populate('toId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

    // Format transactions for frontend
    const formattedTransactions = transactions.map(tx => ({
      _id: tx._id,
      type: tx.fromId._id.toString() === userId ? 'outgoing' : 'incoming',
      amount: tx.amount,
      status: tx.status,
      confirmations: tx.confirmations,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      hash: tx.hash,
      description: tx.description,
      createdAt: tx.createdAt,
      fromName: tx.fromId.name,
      toName: tx.toId.name
    }));

    res.status(200).json({
      success: true,
      count: formattedTransactions.length,
      data: formattedTransactions
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('fromId', 'name email')
      .populate('toId', 'name email');

    if (!transaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }

    // Check if user is authorized to view this transaction
    if (transaction.fromId._id.toString() !== req.user.id && 
        transaction.toId._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view this transaction', 403));
    }

    res.status(200).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    next(error);
  }
};

// Helper function to add transaction to blockchain
async function addTransactionToBlockchain(transaction) {
  try {
    // Get the latest block
    const latestBlock = await Block.findOne().sort({ index: -1 });
    const previousHash = latestBlock ? latestBlock.hash : '0';
    const index = latestBlock ? latestBlock.index + 1 : 0;

    // Create new block data
    const blockData = {
      index,
      timestamp: new Date(),
      transactions: [transaction],
      previousHash,
      nonce: 0
    };

    // Calculate block hash
    const blockString = JSON.stringify(blockData);
    const hash = crypto.createHash('sha256').update(blockString).digest('hex');
    blockData.hash = hash;

    // Save block to database
    await Block.create(blockData);
    
    console.log(`Block ${index} added to blockchain with hash: ${hash.slice(0, 16)}...`);
    
  } catch (error) {
    console.error('Blockchain error:', error);
    // Don't throw error - transaction should still succeed even if blockchain fails
  }
}

// @desc    Get blockchain blocks
// @route   GET /api/transactions/blockchain
// @access  Private  
exports.getBlocks = async (req, res, next) => {
  try {
    const blocks = await Block.find().sort({ index: 1 });
    
    res.status(200).json({
      success: true,
      count: blocks.length,
      data: blocks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
