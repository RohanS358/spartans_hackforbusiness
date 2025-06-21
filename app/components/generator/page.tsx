"use client"

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, X } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Simple encryption using BID as key (basic XOR cipher for demo)
const encryptPassword = (password: string, bid: string) => {
  let encrypted = '';
  for (let i = 0; i < password.length; i++) {
    const charCode = password.charCodeAt(i) ^ bid.charCodeAt(i % bid.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted); // Base64 encode for safe QR transmission
};

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    sub_id: '',
    amount: '',
    password: '',
    bid: ''
  });
  const [qrData, setQRData] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateQR = async () => {
    if (!formData.sub_id || !formData.amount || !formData.password || !formData.bid) {
      alert('Please fill all fields');
      return;
    }

    setIsGenerating(true);

    try {
      // Encrypt password with BID
      const encryptedPassword = encryptPassword(formData.password, formData.bid);
      
      // Create QR data object (compatible with scanner)
      const qrDataObject = {
        sub_id: formData.sub_id,
        amount: parseFloat(formData.amount),
        credits: parseFloat(formData.amount) , // Assuming 1 dollar = 10 credits
        encrypted_password: encryptedPassword,
        timestamp: new Date().toISOString(),
        bid: formData.bid
      };
      
      // Convert to JSON string for QR
      const qrString = JSON.stringify(qrDataObject);
      
      // Generate QR code with higher quality
      const qrDataURL = await QRCode.toDataURL(qrString, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      
      setQRData(qrDataURL);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    // Create download link
    const link = document.createElement('a');
    link.href = qrData;
    link.download = `QR_${formData.sub_id}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    try {
      // Convert data URL to blob
      const response = await fetch(qrData);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      
      alert('QR Code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please use download instead.');
    }
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(qrData);
        const blob = await response.blob();
        const file = new File([blob], `QR_${formData.sub_id}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'Payment QR Code',
          text: `Payment QR for ${formData.sub_id} - Amount: रु ${formData.amount}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to download
        downloadQR();
      }
    } else {
      // Fallback to download if share is not supported
      downloadQR();
    }
  };

  const closeQR = () => {
    setShowQR(false);
    setQRData('');
  };

  const resetForm = () => {
    setFormData({
      sub_id: '',
      amount: '',
      password: '',
      bid: ''
    });
    setShowQR(false);
    setQRData('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="h-6 w-6" />
              QR Code Generator
            </CardTitle>
            <CardDescription>Generate secure payment QR codes for customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sub_id">Subscriber ID</Label>
                <Input
                  id="sub_id"
                  name="sub_id"
                  value={formData.sub_id}
                  onChange={handleInputChange}
                  placeholder="Enter subscriber ID"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bid">BID (Encryption Key)</Label>
                <Input
                  id="bid"
                  name="bid"
                  type="password"
                  value={formData.bid}
                  onChange={handleInputChange}
                  placeholder="Enter BID"
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={generateQR} 
                  className="flex-1"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isGenerating}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Generated QR Code</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeQR}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Payment QR for {formData.sub_id} - ${formData.amount}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  {qrData && (
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <img 
                        src={qrData} 
                        alt="Generated QR Code" 
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Download and Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={downloadQR} 
                    className="w-full"
                    variant="default"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={copyToClipboard} 
                      variant="outline"
                      size="sm"
                    >
                      Copy Image
                    </Button>
                    
                    <Button 
                      onClick={shareQR} 
                      variant="outline"
                      size="sm"
                    >
                      Share
                    </Button>
                  </div>
                </div>

                {/* QR Code Info */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscriber:</span>
                      <span className="font-medium">{formData.sub_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">${formData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">{parseFloat(formData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated:</span>
                      <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  ⚠️ This QR code contains encrypted payment information. Keep it secure.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;