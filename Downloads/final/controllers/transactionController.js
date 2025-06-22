const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Blockchain = require('../blockchain/blockchain'); // Adjust path as needed
const ErrorResponse = require('../utils/errorResponse');
const { decryptPrivateKey } = require('../utils/crypto');
const { generateTransactionQR } = require('../utils/qr');
// Add at the top of your file
const Product = require('../models/Product');
// Initialize blockchain

let blockchain;

try {
  blockchain = new Blockchain();
  console.log('Blockchain initialized successfully');
} catch (error) {
  console.error('Error initializing blockchain:', error);
  process.exit(1); // Exit if blockchain fails to initialize
}
// controllers/transactionController.js
// Add to createTransaction:
// @desc    Create a new blockchain transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const { toAddress, amount, encryptedPrivateKey, productId } = req.body;
    const { id, role } = req.user;
    
    // Validate input
    if (!toAddress || !amount || !encryptedPrivateKey) {
      return next(new ErrorResponse('Please provide toAddress, amount, and private key', 400));
    }
    
    // Get sender's wallet
    const fromWallet = await Wallet.findOne({ 
      owner: id,
      ownerModel: role === 'business' ? 'Business' : 'User' 
    });
    
    if (!fromWallet) {
      return next(new ErrorResponse('You do not have a wallet', 404));
    }
    
    // Verify wallet matches the encrypted private key
    const privateKey = decryptPrivateKey(encryptedPrivateKey);
    const tempWallet = new Wallet(privateKey);
    if (tempWallet.publicKey !== fromWallet.address) {
      return next(new ErrorResponse('Private key does not match wallet', 401));
    }
    
    // Get recipient's wallet
    const toWallet = await Wallet.findOne({ address: toAddress });
    if (!toWallet) {
      return next(new ErrorResponse('Recipient wallet not found', 404));
    }
    
    // Check blockchain balance (more accurate than DB balance)
    const blockchainBalance = blockchain.getBalanceOfAddress(fromWallet.address);
    if (blockchainBalance < amount) {
      return next(new ErrorResponse('Insufficient balance', 400));
    }
    
    // Create transaction data
    const transactionData = {
      productId,
      businessId: toWallet.owner,
      userId: id,
      timestamp: Date.now()
    };
    
    // Create and sign transaction
    const transaction = tempWallet.createTransaction(
      toAddress, 
      amount, 
      transactionData
    );
    
    // Add to blockchain
    blockchain.addTransaction(transaction);
    
    // Generate QR code for transaction verification
    const qrCode = await generateTransactionQR(transaction.hash);
    
    // Create database record
    const dbTransaction = await Transaction.create({
    hash: transaction.hash,
    fromAddress: fromWallet.address,
    toAddress,
    amount,
    // Include product if provided
    product: productId || undefined,
    qrCode,
    // Add these fields if you update your schema
    signature: transaction.signature,
    data: transaction.data,
    status: 'pending'
  });
    
    res.status(201).json({
      success: true,
      data: {
        transaction: {
          hash: dbTransaction.hash,
          fromAddress: dbTransaction.fromAddress,
          toAddress: dbTransaction.toAddress,
          amount: dbTransaction.amount,
          qrCode: dbTransaction.qrCode,
          status: dbTransaction.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a transaction on blockchain
// @route   GET /api/transactions/verify/:hash
// @access  Public
exports.verifyTransaction = async (req, res, next) => {
  try {
    const { hash } = req.params;
    
    // Check database
    const dbTransaction = await Transaction.findOne({ hash });
    if (!dbTransaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }
    
    // Verify on blockchain
    const chainTx = blockchain.getTransactionByHash(hash);
    const isConfirmed = chainTx && chainTx.confirmations > 0;
    
    // Update status if confirmed
    if (isConfirmed && dbTransaction.status !== 'completed') {
      await Transaction.updateOne({ hash }, { status: 'completed' });
      dbTransaction.status = 'completed';
      
      // Update wallet balances in database
      await Wallet.updateOne(
        { address: dbTransaction.fromAddress },
        { $inc: { balance: -dbTransaction.amount } }
      );
      await Wallet.updateOne(
        { address: dbTransaction.toAddress },
        { $inc: { balance: dbTransaction.amount } }
      );
    }
    
    res.status(200).json({
      success: true,
      verified: isConfirmed,
      confirmations: chainTx?.confirmations || 0,
      data: {
        transaction: {
          ...dbTransaction.toObject(),
          confirmed: isConfirmed
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transactions for user's wallet
// @route   GET /api/transactions
// @access  Private
exports.getMyTransactions = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    
    // Get user's wallet
    const wallet = await Wallet.findOne({ 
      owner: id,
      ownerModel: role === 'business' ? 'Business' : 'User' 
    });
    
    if (!wallet) {
      return next(new ErrorResponse('You do not have a wallet', 404));
    }
    
    // Get transactions from database
    const transactions = await Transaction.find({
      $or: [
        { fromAddress: wallet.address },
        { toAddress: wallet.address }
      ]
    }).sort({ timestamp: -1 });
    
    // Enrich with blockchain data
    const enrichedTransactions = await Promise.all(
      transactions.map(async tx => {
        const chainTx = blockchain.getTransactionByHash(tx.hash);
        const product = tx.product ? await Product.findById(tx.product) : null;
        
        return {
          ...tx.toObject(),
          type: tx.fromAddress === wallet.address ? 'outgoing' : 'incoming',
          confirmations: chainTx?.confirmations || 0,
          productName: product?.name
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: enrichedTransactions.length,
      data: enrichedTransactions
    });
  } catch (error) {
    next(error);
  }
};