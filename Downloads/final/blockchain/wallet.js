const ChainUtil = require('./chain-util');
const Transaction = require('./transaction');

class Wallet {
  constructor() {
    this.keyPair = ChainUtil.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
    this.balance = 0;
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  createTransaction(toAddress, amount, data, blockchain) {
    this.balance = blockchain.getBalanceOfAddress(this.publicKey);

    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    const transaction = new Transaction(this.publicKey, toAddress, amount, data);
    transaction.signTransaction(this.keyPair);
    return transaction;
  }
}

module.exports = Wallet;