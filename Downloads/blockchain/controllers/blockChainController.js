const Block = require('../models/Block');
const BlockchainService = require('../services/blockchainService');

class BlockchainController {
  async getBlockchainInfo(req, res) {
    try {
      const latestBlock = await Block.findOne().sort({ index: -1 });
      res.json({
        success: true,
        latestBlockIndex: latestBlock ? latestBlock.index : 0,
        latestBlockHash: latestBlock ? latestBlock.hash : '0',
        difficulty: BlockchainService.difficulty
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getBlock(req, res) {
    try {
      const { index } = req.params;
      const block = await Block.findOne({ index });
      if (!block) {
        return res.status(404).json({ success: false, error: 'Block not found' });
      }
      
      res.json({
        success: true,
        block
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new BlockchainController();