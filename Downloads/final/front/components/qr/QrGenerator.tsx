// components/QrGenerator.jsx
"use client"
import { useState, useRef, useEffect } from 'react';
import { TransactionQR } from './qr';

interface Transaction {
  hash: string;
  amount: number;
  fromAddress: string;
  toAddress: string;
}

interface QrGeneratorProps {
  transaction: Transaction;
}

export function QrGenerator({ transaction }: QrGeneratorProps) {
  const [qrSvg, setQrSvg] = useState('');
  const qrRef = useRef(null);

  // Generate QR on mount and when transaction changes
  useEffect(() => {
    if (transaction) {
      const svg = TransactionQR.generate({
        txHash: transaction.hash,
        amount: transaction.amount,
        from: transaction.fromAddress,
        to: transaction.toAddress,
        timestamp: Date.now()
      });
      setQrSvg(svg);
    }
  }, [transaction]);

  return (
    <div className="qr-container">
      <div 
        ref={qrRef}
        dangerouslySetInnerHTML={{ __html: qrSvg }} 
        className="mx-auto"
        style={{ width: '200px', height: '200px' }}
      />
      <button 
        onClick={() => navigator.clipboard.writeText(JSON.stringify(transaction))}
        className="mt-2 text-sm"
      >
        Copy Transaction Data
      </button>
    </div>
  );
}