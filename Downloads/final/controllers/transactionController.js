const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Blockchain = require('../blockchain');
const ErrorResponse = require('../utils/errorResponse');
const { decryptPrivateKey } = require('../utils/crypto');
const { generateTransactionQR } = require('../utils/qr');

// Initialize blockchain

let blockchain;
try {
  // Check what type Blockchain is and initialize accordingly
  if (typeof Blockchain === 'function') {
    // If Blockchain is directly the constructor
    blockchain = new Blockchain();
  } else if (Blockchain && typeof Blockchain.Blockchain === 'function') {
    // If Blockchain is a module with Blockchain as a property
    blockchain = new Blockchain.Blockchain();
  } else {
    console.error('Invalid Blockchain import structure');
    throw new Error('Could not initialize blockchain');
  }
} catch (error) {
  console.error('Error initializing blockchain:', error);
  // Create a minimal fallback implementation for testing
  blockchain = {
    getBalanceOfAddress: () => 0,
    addTransaction: () => {},
    getTransactionByHash: () => null
  };
}
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
      signature: transaction.signature,
      data: transaction.data,
      status: 'pending',
      qrCode
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
    }).sort({ createdAt: -1 });
    
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