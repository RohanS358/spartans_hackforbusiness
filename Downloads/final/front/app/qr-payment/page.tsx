"use client"

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { QrCode, Scan, ArrowLeft, Wallet, CreditCard } from 'lucide-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function QRPaymentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('scan')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [walletBalance, setWalletBalance] = useState(0)

  // QR Generation state
  const [qrData, setQrData] = useState({
    amount: '',
    description: '',
    businessId: '',
  })
  const [generatedQR, setGeneratedQR] = useState('')

  // QR Scanning state
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadWalletBalance()
    }
  }, [user])

  const loadWalletBalance = async () => {
    try {
      const wallet = await apiClient.getWallet()
      setWalletBalance(wallet.balance || 0)
    } catch (error) {
      console.error('Error loading wallet balance:', error)
    }
  }

  const generateQR = async () => {
    if (!qrData.amount || !qrData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const qrPayload = {
        type: 'payment_request',
        amount: parseFloat(qrData.amount),
        description: qrData.description,
        businessId: user?.role === 'business' ? user.id : qrData.businessId,
        requesterId: user?.id,
        timestamp: Date.now(),
      }

      // Generate QR code data URL
      const qrString = JSON.stringify(qrPayload)
      const qrCodeDataUrl = await generateQRCodeDataUrl(qrString)
      setGeneratedQR(qrCodeDataUrl)

      toast({
        title: 'QR Code Generated',
        description: 'Share this QR code to receive payment',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      })
    }
  }

  const generateQRCodeDataUrl = async (text: string): Promise<string> => {
    // Simple QR code generation - in a real app, you'd use a proper QR library
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 200
    canvas.height = 200
    
    if (ctx) {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 200, 200)
      ctx.fillStyle = 'black'
      ctx.font = '12px Arial'
      ctx.fillText('QR Code', 10, 20)
      ctx.fillText(text.substring(0, 50) + '...', 10, 40)
    }
    
    return canvas.toDataURL()
  }

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not access camera',
        variant: 'destructive',
      })
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setIsScanning(false)
  }

  const handlePayment = async () => {
    if (!paymentData) return

    setIsProcessing(true)
    try {
      await apiClient.createTransaction({
        fromId: user?.id,
        toId: paymentData.requesterId,
        amount: paymentData.amount,
        description: paymentData.description,
        type: 'payment',
      })

      toast({
        title: 'Payment Successful',
        description: `Paid $${paymentData.amount} successfully`,
      })

      setShowPaymentDialog(false)
      setPaymentData(null)
      loadWalletBalance()
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Payment failed',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const processScannedQR = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.type === 'payment_request') {
        setPaymentData(parsed)
        setShowPaymentDialog(true)
        stopScanning()
      } else {
        toast({
          title: 'Invalid QR Code',
          description: 'This QR code is not a valid payment request',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Invalid QR Code',
        description: 'Could not parse QR code data',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QR Payments</h1>
                <p className="text-gray-600">Scan or generate QR codes for payments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  ${walletBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="scan" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Scan className="mr-2 h-4 w-4" />
              Scan QR Code
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scan className="h-5 w-5" />
                  <span>Scan Payment QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isScanning ? (
                  <div className="text-center py-8">
                    <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Click the button below to start scanning QR codes for payments
                    </p>
                    <Button onClick={startScanning}>
                      Start Scanning
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto rounded-lg"
                        autoPlay
                        playsInline
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="text-center">
                      <Button onClick={stopScanning} variant="outline">
                        Stop Scanning
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Manual Input (for testing)</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Paste QR code data here"
                          value={scannedData}
                          onChange={(e) => setScannedData(e.target.value)}
                        />
                        <Button onClick={() => processScannedQR(scannedData)}>
                          Process
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Generate Payment QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={qrData.amount}
                        onChange={(e) => setQrData({ ...qrData, amount: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Payment for..."
                        value={qrData.description}
                        onChange={(e) => setQrData({ ...qrData, description: e.target.value })}
                      />
                    </div>

                    <Button onClick={generateQR} className="w-full">
                      Generate QR Code
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {generatedQR ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Share this QR code to receive payment
                        </p>
                        <img
                          src={generatedQR}
                          alt="Payment QR Code"
                          className="mx-auto border rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                        <div className="text-center text-gray-500">
                          <QrCode className="h-12 w-12 mx-auto mb-2" />
                          <p>QR code will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paymentData && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">${paymentData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span>{paymentData.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Balance:</span>
                    <span className={walletBalance >= paymentData.amount ? 'text-green-600' : 'text-red-600'}>
                      ${walletBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {walletBalance < paymentData.amount && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-red-800 text-sm">
                      Insufficient balance. Please add funds to your wallet.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowPaymentDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || walletBalance < paymentData.amount}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
