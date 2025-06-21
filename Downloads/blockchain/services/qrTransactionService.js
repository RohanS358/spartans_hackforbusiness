const QRTransaction = require('../models/QRTransaction');
const SubAccount = require('../models/SubAccount');
const WalletService = require('./walletService');
const TransactionService = require('./transactionService');
const QRService = require('./qrService');
const { QR_STATUS } = require('../config/constants');

class QRTransactionService {
  async generateQRTransaction(senderWalletId, subAccountId, amount, senderPasskey) {
    const wallet = await WalletService.authenticateWallet(senderWalletId, senderPasskey);
    const senderPrivateKey = await WalletService.getPrivateKey(senderWalletId, senderPasskey);
    const senderPublicKey = wallet.publicKey;
    
    const subAccount = await SubAccount.findOne({ subAccountId });
    if (!subAccount) {
      throw new Error('Sub-account not found');
    }
    
    const qrId = CryptoService.hash(senderWalletId + subAccountId + amount.toString() + Date.now());
    
    const qrPayload = await QRService.createTransactionQRData(
      subAccountId,
      amount,
      senderPrivateKey,
      senderPublicKey,
      qrId
    );
    
    const qrTransaction = new QRTransaction({
      qrId,
      senderWalletId,
      subAccountId,
      amount,
      qrData: qrPayload,
      status: QR_STATUS.GENERATED
    });
    
    await qrTransaction.save();
    
    const qrImage = await QRService.generateQRCode(qrPayload);
    
    return {
      qrId,
      qrImage
    };
  }

  async scanQRTransaction(qrData, receiverWalletId, receiverPasskey) {
    if (qrData.type !== 'blockchain_transaction') {
      throw new Error('Invalid QR code type');
    }
    
    const qrId = qrData.qrId;
    if (!qrId) {
      throw new Error('Missing QR ID');
    }
    
    const qrTransaction = await QRTransaction.findOne({ qrId });
    if (!qrTransaction) {
      throw new Error('QR transaction not found');
    }
    
    if (qrTransaction.status !== QR_STATUS.GENERATED) {
      throw new Error('QR code already processed or expired');
    }
    
    const receiverWallet = await WalletService.authenticateWallet(receiverWalletId, receiverPasskey);
    
    const encryptionPassword = CryptoService.hash(qrId + QR.ENCRYPTION_PREFIX);
    const decryptedData = await CryptoService.decryptData(
      qrData.encryptedData,
      qrData.salt,
      encryptionPassword
    );
    
    const transactionData = JSON.parse(decryptedData);
    
    if (transactionData.qrId !== qrId) {
      throw new Error('QR data integrity check failed');
    }
    
    await QRTransaction.updateOne(
      { qrId },
      {
        $set: {
          status: QR_STATUS.SCANNED,
          scannedAt: Date.now(),
          receiverWalletId
        }
      }
    );
    
    return {
      success: true,
      qrId,
      senderWalletId: qrTransaction.senderWalletId,
      receiverWalletId,
      subAccountId: transactionData.subAccountId,
      amount: transactionData.amount,
      senderPublicKey: transactionData.senderPublicKey,
      receiverPublicKey: receiverWallet.publicKey,
      decryptedData: transactionData
    };
  }

  async executeQRTransaction(qrId, receiverWalletId) {
    const qrTransaction = await QRTransaction.findOne({ qrId });
    if (!qrTransaction) {
      throw new Error('QR transaction not found');
    }
    
    if (qrTransaction.status !== QR_STATUS.SCANNED) {
      throw new Error('QR transaction not properly scanned');
    }
    
    if (qrTransaction.receiverWalletId !== receiverWalletId) {
      throw new Error('Receiver wallet mismatch');
    }
    
    const encryptionPassword = CryptoService.hash(qrId + QR.ENCRYPTION_PREFIX);
    const decryptedData = await CryptoService.decryptData(
      qrTransaction.qrData.encryptedData,
      qrTransaction.qrData.salt,
      encryptionPassword
    );
    
    const transactionData = JSON.parse(decryptedData);
    
    const transaction = await TransactionService.createTransaction(
      qrTransaction.senderWalletId,
      receiverWalletId,
      qrTransaction.amount,
      transactionData.privateKey,
      qrId
    );
    
    await QRTransaction.updateOne(
      { qrId },
      {
        $set: {
          status: QR_STATUS.COMPLETED,
          completedAt: Date.now(),
          transactionId: transaction.txId
        }
      }
    );
    
    return {
      success: true,
      transactionId: transaction.txId,
      qrId,
      message: 'Transaction created successfully, awaiting verification'
    };
  }

  async verifyQRTransactionReceipt(qrId, receiverPublicKey) {
    const qrTransaction = await QRTransaction.findOne({ qrId });
    if (!qrTransaction) {
      throw new Error('QR transaction not found');
    }
    
    if (qrTransaction.status !== QR_STATUS.COMPLETED) {
      throw new Error('QR transaction not completed');
    }
    
    if (!qrTransaction.transactionId) {
      throw new Error('No transaction ID found');
    }
    
    const result = await TransactionService.verifyAndConfirmTransaction(
      qrTransaction.transactionId,
      receiverPublicKey
    );
    
    await QRTransaction.updateOne(
      { qrId },
      { $set: { status: QR_STATUS.VERIFIED } }
    );
    
    result.qrId = qrId;
    result.qrVerification = 'QR transaction fully verified and confirmed';
    
    return result;
  }
}

module.exports = new QRTransactionService();