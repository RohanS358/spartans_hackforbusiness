const ChainUtil = require('./chain-util');
const Transaction = require('./transaction');

class Block {
  constructor(timestamp, transactions, previousHash = '', difficulty = 2) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
    this.difficulty = difficulty;
  }

  calculateHash() {
    return ChainUtil.hash(
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce +
      this.difficulty
    ).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Block;