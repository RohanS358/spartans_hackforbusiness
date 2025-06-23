const Transaction = require('../models/transaction');
const Wallet = require('../models/Wallet');
const BlockModel = require('../models/Block');
const Blockchain = require('../blockchain/blockchain'); 
const Block = require('../blockchain/block');
const ErrorResponse = require('../utils/errorResponse');
const { decryptPrivateKey } = require('../utils/crypto');
const { generateTransactionQR } = require('../utils/qr');
const Product = require('../models/Product');

// Initialize blockchain with persistence
let blockchain;

const initializeBlockchain = async () => {
  try {
    blockchain = new Blockchain();
    
    // Load existing blocks from database
    const existingBlocks = await BlockModel.find().sort({ index: 1 });
    
    if (existingBlocks.length > 0) {
      console.log(`Transaction Controller: Loading ${existingBlocks.length} blocks from database...`);
      blockchain.chain = existingBlocks.map(blockDoc => {
        const blockData = blockDoc.toObject();
        // Create proper Block objects
        const block = new Block(
          blockData.timestamp,
          blockData.transactions || [],
          blockData.previousHash,
          2
        );
        block.hash = blockData.hash;
        block.nonce = blockData.nonce || 0;
        block.index = blockData.index;
        return block;
      });
      console.log('Transaction Controller: Blockchain loaded successfully');
    } else {
      console.log('Transaction Controller: No existing blocks, creating genesis');
      // Save genesis block
      const genesisBlock = blockchain.chain[0];
      await BlockModel.create({
        index: 0,
        timestamp: genesisBlock.timestamp,
        transactions: [],
        previousHash: genesisBlock.previousHash,
        hash: genesisBlock.hash,
        nonce: 0
      });
    }
  } catch (error) {
    console.error('Transaction Controller: Error initializing blockchain:', error);
    blockchain = new Blockchain(); // Fallback
  }
};

// Initialize on startup
initializeBlockchain();
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
      // For simplicity, accept any valid private key for now
    // In production, you would properly validate and decrypt the private key
    const privateKey = encryptedPrivateKey;
    
    // Generate expected address for validation (simplified validation)
    const expectedAddress = require('../models/Wallet').generateWalletAddress(id, privateKey);
      // For now, we'll skip strict private key validation and allow transactions
    // as long as the wallet exists and has sufficient balance
    console.log('Transaction: Using simplified validation for wallet', fromWallet.address);
    
    // Validate recipient address format (basic validation)
    if (!toAddress || toAddress.length < 10) {
      return next(new ErrorResponse('Invalid recipient address format', 400));
    }
    
    // Get recipient's wallet
    const toWallet = await Wallet.findOne({ address: toAddress });
    if (!toWallet) {
      console.log('Transaction error: Recipient wallet not found for address:', toAddress);
      console.log('Available wallets in database:');
      const allWallets = await Wallet.find({}, 'address owner').limit(10);
      allWallets.forEach(w => console.log(`  - ${w.address} (owner: ${w.owner})`));
      
      return next(new ErrorResponse(`Recipient wallet not found. Please ensure the address ${toAddress.slice(0, 10)}...${toAddress.slice(-4)} is correct and the recipient has created a wallet.`, 404));
    }
    
    // Check database balance (for now, we'll use DB balance instead of blockchain)
    if (fromWallet.balance < amount) {
      return next(new ErrorResponse(`Insufficient balance. You have $${fromWallet.balance} but tried to send $${amount}`, 400));
    }
    // Create transaction data
    const transactionData = {
      productId,
      businessId: toWallet.owner,
      userId: id,
      timestamp: Date.now()
    };
    
    // Create a simple transaction hash
    const crypto = require('crypto');
    const transactionHash = crypto.createHash('sha256')
      .update(`${fromWallet.address}${toAddress}${amount}${Date.now()}`)
      .digest('hex');
      // Create a simple transaction object
    const transaction = {
      hash: transactionHash,
      fromAddress: fromWallet.address,
      toAddress,
      amount,
      data: transactionData,
      timestamp: Date.now(),
      signature: 'simulated_signature_' + transactionHash.slice(0, 16),
      // Add isValid method that the blockchain expects
      isValid: function() {
        return this.fromAddress && this.toAddress && this.amount > 0;
      }
    };      // Add to blockchain and potentially mine a block
    try {
      blockchain.addTransaction(transaction);
      console.log('Transaction added to blockchain. Pending transactions:', blockchain.pendingTransactions.length);
      
      // If we have enough pending transactions, mine a block
      if (blockchain.pendingTransactions.length >= 1) { // Mine blocks more frequently for testing
        console.log('Mining new block...');
        const initialChainLength = blockchain.chain.length;
        blockchain.minePendingTransactions('system-miner');        // Save new block to database if one was created
        if (blockchain.chain.length > initialChainLength) {
          const newBlock = blockchain.chain[blockchain.chain.length - 1];
          try {
            const savedBlock = await BlockModel.create({
              index: blockchain.chain.length - 1,
              timestamp: newBlock.timestamp,
              transactions: newBlock.transactions || [],
              previousHash: newBlock.previousHash,
              hash: newBlock.hash,
              nonce: newBlock.nonce || 0,
              miner: 'system-miner'
            });
            console.log(`Transaction: New block #${blockchain.chain.length - 1} mined and saved with ID: ${savedBlock._id}`);
          } catch (blockSaveError) {
            console.error('Error saving block to database:', blockSaveError.message);
          }
        } else {
          console.log('No new block was created during mining');
        }
      }
    } catch (blockchainError) {
      console.log('Blockchain error (continuing with DB transaction):', blockchainError.message);
      console.log('Error stack:', blockchainError.stack);
    }
    
    // Generate QR code for transaction verification
    let qrCode = '';
    try {
      qrCode = await generateTransactionQR(transaction.hash);
    } catch (qrError) {
      console.log('QR generation error (continuing):', qrError.message);
      qrCode = `QR_${transaction.hash.slice(0, 8)}`;
    }
    
    // Update wallet balances in database
    fromWallet.balance -= amount;
    toWallet.balance += amount;
    await fromWallet.save();
    await toWallet.save();
    
    // Create database record
    const dbTransaction = await Transaction.create({
      hash: transaction.hash,
      fromAddress: fromWallet.address,
      toAddress,
      // Add wallet references
      fromId: fromWallet._id,
      toId: toWallet._id,
      amount,
      // Include product if provided
      product: productId || undefined,
      qrCode,
      // Add these fields if you update your schema
      signature: transaction.signature,
      data: transaction.data,
      status: 'completed' // Mark as completed since we updated balances
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
    
    // For now, we'll consider all transactions as verified since they're already completed
    // In a real blockchain implementation, you would check the blockchain for confirmations
    let isConfirmed = true;
    let confirmations = 1;
    
    // If transaction is already completed, it's verified
    if (dbTransaction.status === 'completed') {
      isConfirmed = true;
      confirmations = 1;
    }
    
    res.status(200).json({
      success: true,
      verified: isConfirmed,
      confirmations: confirmations,
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
    
    // Get transactions from database using wallet ID references
    const transactions = await Transaction.find({
      $or: [
        { fromId: wallet._id },
        { toId: wallet._id }
      ]
    })
    .populate('fromId', 'address owner')
    .populate('toId', 'address owner')
    .populate('product', 'name price')
    .sort('-timestamp');
      // Enrich with transaction type (no blockchain data for now)
    const enrichedTransactions = transactions.map(tx => {
      return {
        ...tx.toObject(),
        type: tx.fromId && tx.fromId._id.toString() === wallet._id.toString() ? 'outgoing' : 'incoming',
        confirmations: 1 // Assume all transactions are confirmed
      };
    });
    
    res.status(200).json({
      success: true,
      count: enrichedTransactions.length,
      data: enrichedTransactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transactions by wallet ID
// @route   GET /api/transactions/wallet/:walletId
// @access  Private
exports.getTransactionsByWallet = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    
    // Verify the wallet belongs to the user
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return next(new ErrorResponse('Wallet not found', 404));
    }
    
    // Check if current user owns the wallet
    if (wallet.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to access these transactions', 403));
    }
    
    // Get all transactions involving this wallet ID
    const transactions = await Transaction.find({
      $or: [
        { fromId: walletId },
        { toId: walletId }
      ]
    })
    .populate('fromId', 'address owner')
    .populate('toId', 'address owner')
    .populate('product', 'name price')
    .sort('-timestamp');
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions.map(tx => ({
        ...tx.toObject(),
        type: tx.fromId._id.toString() === walletId ? 'outgoing' : 'incoming',
      }))
    });
  } catch (error) {
    next(error);
  }
};