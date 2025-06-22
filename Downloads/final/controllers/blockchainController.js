const Blockchain = require('../blockchain/blockchain');
const Wallet = require('../blockchain/wallet');
const Transaction = require('../models/transaction');

const blockchain = new Blockchain();

exports.getBlockchain = (req, res) => {
  res.json(blockchain);
};

exports.createTransaction = (req, res) => {
  const { fromAddress, toAddress, amount, data } = req.body;
  
  try {
    const transaction = new Transaction(fromAddress, toAddress, amount, data);
    blockchain.addTransaction(transaction);
    res.status(201).json({ message: 'Transaction added to pending', transaction });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.minePendingTransactions = (req, res) => {
  const { miningRewardAddress } = req.body;
  
  try {
    blockchain.minePendingTransactions(miningRewardAddress);
    res.json({ 
      message: 'New block mined successfully',
      chain: blockchain.chain
    });
  } catch (err) {
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