const Block = require('../models/Block');
const CryptoService = require('./cryptoService');
// ...existing code...
const Transaction = require('../models/Transaction');
const { BLOCKCHAIN } = require('../config/constants');

class BlockchainService {
  constructor() {
    this.difficulty = BLOCKCHAIN.DIFFICULTY;
    this.initializeBlockchain();
  }

  async initializeBlockchain() {
    const latestBlock = await Block.findOne().sort({ index: -1 });
    if (!latestBlock) {
      const genesisBlock = new Block({
        ...BLOCKCHAIN.GENESIS_BLOCK,
        hash: this.calculateBlockHash(BLOCKCHAIN.GENESIS_BLOCK, [])
      });
      await genesisBlock.save();
    }
  }

  calculateBlockHash(block, transactions) {
    const txString = JSON.stringify(transactions);
    const blockString = [
      block.index,
      block.timestamp,
      txString,
      block.previousHash,
      block.nonce
    ].join('');
    return CryptoService.hash(blockString);
  }

  async mineBlock(transactions) {
    const latestBlock = await Block.findOne().sort({ index: -1 });
    
    const block = {
      index: latestBlock.index + 1,
      timestamp: Date.now(),
      transactions: transactions.map(tx => tx.txId),
      previousHash: latestBlock.hash,
      nonce: 0,
      hash: ''
    };
    
    // Simple proof of work
    const target = '0'.repeat(this.difficulty);
    while (!block.hash.startsWith(target)) {
      block.nonce++;
      block.hash = this.calculateBlockHash(block, transactions);
    }
    
    const newBlock = new Block(block);
    await newBlock.save();
    
    // Update transaction statuses
    await Transaction.updateMany(
      { txId: { $in: block.transactions } },
      { $set: { status: 'confirmed', blockHash: block.hash } }
    );
    
    return newBlock;
  }
}

module.exports = new BlockchainService();