// utils/qr.js (Client-side version)
import QRCode from 'qrcode-generator';

export class TransactionQR {
  static generate(txData) {
    // Set up QR code
    const qr = QRCode(0, 'L'); // 0=auto version, L=error correction level
    qr.addData(JSON.stringify(txData));
    qr.make();
    
    // Return as SVG string (works offline)
    return qr.createSvgTag({
      scalable: true,
      margin: 2
    });
  }

  static scan(qrSvgElement) {
    // In a real app, you'd use a QR scanner library
    // This is a placeholder that would work with actual scanning
    try {
      const svgText = qrSvgElement.textContent;
      const start = svgText.indexOf('{"');
      const end = svgText.lastIndexOf('"}') + 2;
      return JSON.parse(svgText.slice(start, end));
    } catch {
      throw new Error('Invalid QR code');
    }
  }
}