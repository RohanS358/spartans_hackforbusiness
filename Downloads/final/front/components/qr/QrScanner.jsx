// components/QrScanner.jsx
"use client"
import { useRef, useState } from 'react';
import { TransactionQR } from '.qr';

export function QrScanner({ onScan }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  const handleScan = () => {
    try {
      // In a real app, this would use the device camera
      // This is a mock implementation for offline demo
      const mockTransaction = {
        txHash: '0x123...abc',
        amount: 10,
        from: '0xSender...',
        to: '0xRecipient...'
      };
      const svg = TransactionQR.generate(mockTransaction);
      const data = TransactionQR.scan({ textContent: svg });
      onScan(data);
    } catch (err) {
      setError('Failed to scan QR code');
    }
  };

  return (
    <div className="scanner-container">
      <div className="scanner-placeholder" ref={videoRef}>
        {/* Placeholder for camera feed */}
        <p>Camera feed would appear here</p>
      </div>
      <button 
        onClick={handleScan}
        className="scan-button"
      >
        Scan QR Code
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}