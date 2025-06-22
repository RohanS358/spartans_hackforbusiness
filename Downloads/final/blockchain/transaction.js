const ChainUtil = require('./chain-util');

class Transaction {
  constructor(fromAddress, toAddress, amount, data = {}) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.data = data; // Additional transaction data
    this.hash = this.calculateHash();
    this.signature = null;
  }

  calculateHash() {
    return ChainUtil.hash(
      this.fromAddress + 
      this.toAddress + 
      this.amount + 
      this.timestamp +
      JSON.stringify(this.data)
    ).toString();
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    this.signature = signingKey.sign(this.hash).toDER('hex');
  }

  isValid() {
    if (this.fromAddress === null) return true; // Mining reward

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ChainUtil.ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.hash, this.signature);
  }
}

module.exports = Transaction;