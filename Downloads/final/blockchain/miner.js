const Block = require('./block');

class Miner {
  constructor(blockchain) {
    this.blockchain = blockchain;
  }

  mine(pendingTransactions) {
    const latestBlock = this.blockchain.getLatestBlock();
    const newBlock = new Block(
      Date.now(),
      pendingTransactions,
      latestBlock.hash,
      this.blockchain.difficulty
    );

    newBlock.mineBlock(this.blockchain.difficulty);
    return newBlock;
  }
}

module.exports = Miner;