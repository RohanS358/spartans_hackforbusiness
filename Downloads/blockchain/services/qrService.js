const QRCode = require('qrcode');
const CryptoService = require('./cryptoService');
const { QR } = require('../config/constants');

class QRService {
  static async generateQRCode(data) {
    try {
      const qrDataURL = await QRCode.toDataURL(JSON.stringify(data));
      return qrDataURL;
    } catch (err) {
      throw new Error('QR generation failed');
    }
  }

  static async createTransactionQRData(subAccountId, amount, privateKey, senderPublicKey, qrId) {
    const transactionData = {
      qrId,
      subAccountId,
      amount,
      privateKey,
      senderPublicKey,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const jsonData = JSON.stringify(transactionData);
    const encryptionPassword = CryptoService.hash(qrId + QR.ENCRYPTION_PREFIX);
    const encryptedResult = await CryptoService.encryptData(jsonData, encryptionPassword);

    return {
      type: 'blockchain_transaction',
      encryptedData: encryptedResult.encryptedData,
      salt: encryptedResult.salt,
      qrId
    };
  }
}

module.exports = QRService;