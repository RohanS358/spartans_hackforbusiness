const express = require('express');
const router = express.Router();
const QRController = require('../controllers/qrController');

router.post('/generate-qr-transaction', QRController.generateQRTransaction);
router.post('/scan-qr-transaction', QRController.scanQRTransaction);
router.post('/execute-qr-transaction', QRController.executeQRTransaction);
router.post('/verify-qr-transaction', QRController.verifyQRTransaction);
router.get('/qr-transaction-status/:qrId', QRController.getQRTransactionStatus);

module.exports = router;