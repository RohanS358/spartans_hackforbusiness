const Blockchain = require('../blockchain/blockchain');
const Block = require('../blockchain/block');
const Wallet = require('../blockchain/wallet');
const Transaction = require('../models/transaction');
const BlockModel = require('../models/Block');

let blockchain;

// Initialize blockchain with persistent storage
const initializeBlockchain = async () => {
  try {
    blockchain = new Blockchain();
    
    // Load existing blocks from database
    const existingBlocks = await BlockModel.find().sort({ index: 1 });
    
    if (existingBlocks.length > 0) {
      console.log(`Loading ${existingBlocks.length} blocks from database...`);
      // Replace the chain with loaded blocks, converting them to proper Block objects
      blockchain.chain = existingBlocks.map(blockDoc => {
        const blockData = blockDoc.toObject();
        // Create a proper Block object with methods
        const block = new Block(
          blockData.timestamp,
          blockData.transactions || [],
          blockData.previousHash,
          2 // difficulty
        );
        block.hash = blockData.hash;
        block.nonce = blockData.nonce || 0;
        block.index = blockData.index;
        return block;
      });
      console.log('Blockchain loaded from database successfully');
    } else {
      console.log('No existing blocks found, starting with genesis block');
      // Save genesis block to database
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
    console.error('Error initializing blockchain:', error);
    blockchain = new Blockchain(); // Fallback
  }
};

// Initialize on startup
initializeBlockchain();

exports.getBlockchain = (req, res) => {
  res.json(blockchain);
};

exports.createTransaction = async (req, res) => {
  const { fromAddress, toAddress, amount, data, privateKey } = req.body;
  
  try {
    // Validate required fields
    if (!fromAddress || !toAddress || amount === undefined) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: fromAddress, toAddress, and amount are required" 
      });
    }

    // Create blockchain transaction
    let transaction;
    if (privateKey) {
      // If private key is provided, create a proper signed transaction
      const wallet = new Wallet(privateKey);
      if (wallet.publicKey !== fromAddress) {
        return res.status(400).json({
          success: false,
          error: "Private key does not match sender address"
        });
      }
      transaction = wallet.createTransaction(toAddress, amount, data || {});
    } else {
      // Create an unsigned transaction (not recommended for production)
      transaction = new Transaction(fromAddress, toAddress, amount, data || {});
    }

    // Add to blockchain
    blockchain.addTransaction(transaction);
    
    // Save to database as an object (not a string)
    const dbTransaction = await Transaction.create({
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      amount: transaction.amount,
      hash: transaction.hash,
      data: data || {},
      timestamp: transaction.timestamp
    });

    res.status(201).json({ 
      success: true,
      message: 'Transaction added to pending', 
      transaction: dbTransaction 
    });
  } catch (err) {
    console.error("Transaction creation error:", err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.minePendingTransactions = async (req, res) => {
  const { miningRewardAddress } = req.body;
  
  try {
    const initialChainLength = blockchain.chain.length;
    blockchain.minePendingTransactions(miningRewardAddress);
    
    // If a new block was added, save it to database
    if (blockchain.chain.length > initialChainLength) {
      const newBlock = blockchain.chain[blockchain.chain.length - 1];
      await Block.create({
        index: blockchain.chain.length - 1,
        timestamp: newBlock.timestamp,
        transactions: newBlock.transactions || [],
        previousHash: newBlock.previousHash,
        hash: newBlock.hash,
        nonce: newBlock.nonce || 0,
        miner: miningRewardAddress || 'system'
      });
      console.log(`New block #${blockchain.chain.length - 1} saved to database`);
    }
    
    res.json({ 
      message: 'New block mined successfully',
      chainLength: blockchain.chain.length,
      latestBlock: blockchain.getLatestBlock()
    });
  } catch (err) {
    console.error('Mining error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBalance = (req, res) => {
  const { address } = req.params;
  const balance = blockchain.getBalanceOfAddress(address);
  res.json({ address, balance });
};

exports.validateChain = (req, res) => {
  const isValid = blockchain.isChainValid();
  res.json({ isValid });
};

// Get blockchain stats
exports.getStats = async (req, res) => {
  try {
    // Get stats from database as well
    const dbBlocks = await BlockModel.find();
    const dbBlockCount = dbBlocks.length;
    
    let isValid = true;
    try {
      isValid = blockchain.isChainValid();
    } catch (validationError) {
      console.log('Blockchain validation error:', validationError.message);
      isValid = false;
    }
    
    res.json({
      totalBlocks: Math.max(blockchain.chain.length, dbBlockCount),
      totalBlocksInMemory: blockchain.chain.length,
      totalBlocksInDB: dbBlockCount,
      pendingTransactions: blockchain.pendingTransactions.length,
      difficulty: blockchain.difficulty,
      miningReward: blockchain.miningReward,
      isValid: isValid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all blocks
exports.getBlocks = async (req, res) => {
  try {
    // Get blocks from database for persistent storage
    const dbBlocks = await BlockModel.find().sort({ index: 1 });
    
    res.json({
      success: true,
      count: dbBlocks.length,
      memoryCount: blockchain.chain.length,
      data: dbBlocks.length > 0 ? dbBlocks : blockchain.chain
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific block
exports.getBlock = (req, res) => {
  const { index } = req.params;
  const blockIndex = parseInt(index);
  
  if (blockIndex < 0 || blockIndex >= blockchain.chain.length) {
    return res.status(404).json({
      success: false,
      error: 'Block not found'
    });
  }
  
  res.json({
    success: true,
    data: blockchain.chain[blockIndex]
  });
};