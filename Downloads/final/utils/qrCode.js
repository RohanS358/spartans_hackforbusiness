// utils/qrCode.js
const QRCode = require('qrcode');

// Generate QR code as data URL
exports.generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};