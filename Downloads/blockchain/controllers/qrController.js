const QRTransactionService = require('../services/qrTransactionService');

class QRController {
  async generateQRTransaction(req, res) {
    try { 
      const { senderWalletId, subAccountId, amount, senderPasskey } = req.body;
      const { qrId, qrImage } = await QRTransactionService.generateQRTransaction(
        senderWalletId,
        subAccountId,
        amount,
        senderPasskey
      );
      
      res.json({
        success: true,
        qrId,
        qrImage,
        message: 'QR code generated successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async scanQRTransaction(req, res) {
    try {
      const { qrData, receiverWalletId, receiverPasskey } = req.body;
      const result = await QRTransactionService.scanQRTransaction(
        qrData,
        receiverWalletId,
        receiverPasskey
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async executeQRTransaction(req, res) {
    try {
      const { qrId, receiverWalletId } = req.body;
      const result = await QRTransactionService.executeQRTransaction(
        qrId,
        receiverWalletId
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async verifyQRTransaction(req, res) {
    try {
      const { qrId, receiverPublicKey } = req.body;
      const result = await QRTransactionService.verifyQRTransactionReceipt(
        qrId,
        receiverPublicKey
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getQRTransactionStatus(req, res) {
    try {
      const { qrId } = req.params;
      const qrTransaction = await QRTransaction.findOne({ qrId });
      if (!qrTransaction) {
        return res.status(404).json({ success: false, error: 'QR transaction not found' });
      }
      
      res.json({
        success: true,
        qrId,
        status: qrTransaction.status,
        amount: qrTransaction.amount,
        createdAt: qrTransaction.createdAt,
        scannedAt: qrTransaction.scannedAt,
        completedAt: qrTransaction.completedAt,
        transactionId: qrTransaction.transactionId
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new QRController();