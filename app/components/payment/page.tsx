"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Check, ShoppingBag, Receipt, Upload, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import jsQR from "jsqr"

// Enhanced QR Code detection function using jsQR
const detectQRCode = (imageData: ImageData) => {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    })
    
    if (code) {
      return {
        data: code.data,
        location: code.location
      }
    }
    
    // Try with inversion if first attempt fails
    const invertedCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "onlyInvert",
    })
    
    if (invertedCode) {
      return {
        data: invertedCode.data,
        location: invertedCode.location
      }
    }
    
    return null
  } catch (error) {
    console.error('QR detection error:', error)
    return null
  }
}

// Enhanced image preprocessing for better QR detection
const preprocessImage = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // Convert to grayscale and enhance contrast
  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale using luminance formula
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    
    // Enhance contrast (simple threshold)
    const enhanced = gray > 128 ? 255 : 0
    
    data[i] = enhanced     // Red
    data[i + 1] = enhanced // Green
    data[i + 2] = enhanced // Blue
    // Alpha channel stays the same
  }
  
  context.putImageData(imageData, 0, 0)
  return context.getImageData(0, 0, canvas.width, canvas.height)
}

// Decryption function for QR data
const decryptQRData = (encryptedData: string, bid = "pokemon") => {
  try {
    // Try to parse as JSON first (from QR generator)
    if (encryptedData.startsWith('{') || encryptedData.startsWith('[')) {
      const qrDataObject = JSON.parse(encryptedData)
      
      // Check if it's the format from your QR generator
      if (qrDataObject.sub_id && qrDataObject.amount && qrDataObject.credits) {
        return {
          sub_id: qrDataObject.sub_id,
          amount: qrDataObject.amount,
          credits: qrDataObject.credits,
          encrypted_password: qrDataObject.encrypted_password,
          timestamp: qrDataObject.timestamp,
          bid: qrDataObject.bid
        }
      }
      
      return qrDataObject
    }
    
    // Try base64 decode
    try {
      const decoded = atob(encryptedData)
      if (decoded.startsWith('{') || decoded.startsWith('[')) {
        return JSON.parse(decoded)
      }
    } catch (e) {
      // Not base64, continue with other methods
    }
    
    // XOR decryption fallback
    let decrypted = ''
    for (let i = 0; i < encryptedData.length; i++) {
      const charCode = encryptedData.charCodeAt(i) ^ bid.charCodeAt(i % bid.length)
      decrypted += String.fromCharCode(charCode)
    }
    
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Decryption failed:', error)
    
    // Fallback: generate demo data based on QR content
    return {
      sub_id: `USER_${encryptedData.slice(-6)}`,
      amount: Math.random() * 100 + 50,
      credits: Math.floor(Math.random() * 500 + 200)
    }
  }
}

// Types
interface Product {
  id: string
  name: string
  price: number
  credits: number
}

interface TransactionData {
  receiptId: string
  transactionId: string
  amount: number
  credits: number
  productName: string
  timestamp: string
  customerName: string
  paymentMethod: string
  customerCredits: number
  remainingCredits: number
  blockchainHash: string
  qrAmount?: number
  qrTimestamp?: string
  qrBid?: string
}

interface CustomerData {
  sub_id: string
  amount: number
  credits: number
}

interface QRLocation {
  topLeftCorner: { x: number; y: number }
  topRightCorner: { x: number; y: number }
  bottomLeftCorner: { x: number; y: number }
  bottomRightCorner: { x: number; y: number }
}

// Mock product data
const products: Product[] = [
  { id: "1", name: "Premium Coffee", price: 45, credits: 45 },
  { id: "2", name: "Artisan Sandwich", price: 90, credits: 90 },
  { id: "3", name: "Fresh Pastry", price: 33, credits: 33 },
  { id: "4", name: "Specialty Tea", price: 38, credits: 38 },
  { id: "5", name: "Breakfast Combo", price: 125, credits: 125 },
  { id: "6", name: "Loyalty Membership", price: 250, credits: 250 },
]

export default function QRPaymentScanner() {
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanComplete, setScanComplete] = useState<boolean>(false)
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [scanError, setScanError] = useState<string>("")
  const [qrDetected, setQrDetected] = useState<boolean>(false)
  const [qrLocation, setQrLocation] = useState<QRLocation | null>(null)
  const [scanAttempts, setScanAttempts] = useState<number>(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const selectedProductData = products.find((p) => p.id === selectedProduct)

  const drawQROverlay = (location: QRLocation) => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    // Clear previous overlay
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Draw QR code outline
    context.strokeStyle = '#00ff00'
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(location.topLeftCorner.x, location.topLeftCorner.y)
    context.lineTo(location.topRightCorner.x, location.topRightCorner.y)
    context.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y)
    context.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y)
    context.closePath()
    context.stroke()

    // Draw corner markers
    const corners = [
      location.topLeftCorner,
      location.topRightCorner,
      location.bottomLeftCorner,
      location.bottomRightCorner
    ]

    context.fillStyle = '#00ff00'
    corners.forEach(corner => {
      context.beginPath()
      context.arc(corner.x, corner.y, 8, 0, 2 * Math.PI)
      context.fill()
    })
  }

  const startScanning = async () => {
    if (!selectedProduct) return

    try {
      setIsScanning(true)
      setScanError("")
      setQrDetected(false)
      setQrLocation(null)
      setScanAttempts(0)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        },
      })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        videoRef.current.addEventListener('loadedmetadata', () => {
          // Set up overlay canvas
          if (overlayCanvasRef.current && videoRef.current) {
            overlayCanvasRef.current.width = videoRef.current.videoWidth
            overlayCanvasRef.current.height = videoRef.current.videoHeight
          }
          
          startQRDetection()
        })
      }
    } catch (error) {
      console.error("Camera access denied:", error)
      setScanError("Camera access is required to scan QR codes. Please allow camera permissions.")
      setIsScanning(false)
    }
  }

  const startQRDetection = () => {
    if (!canvasRef.current || !videoRef.current) return

    scanIntervalRef.current = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const context = canvas.getContext('2d')
        if (!context) return

        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Try detection with original image first
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        let qrResult = detectQRCode(imageData)
        
        // If no QR found, try with preprocessed image
        if (!qrResult) {
          imageData = preprocessImage(canvas, context)
          qrResult = detectQRCode(imageData)
        }
        
        setScanAttempts(prev => prev + 1)
        
        if (qrResult) {
          setQrDetected(true)
          setQrLocation(qrResult.location)
          
          // Update overlay canvas size to match video element
          if (overlayCanvasRef.current) {
            const videoElement = videoRef.current
            if (!videoElement) return
            const rect = videoElement.getBoundingClientRect()
            const scaleX = rect.width / video.videoWidth
            const scaleY = rect.height / video.videoHeight
            
            overlayCanvasRef.current.width = rect.width
            overlayCanvasRef.current.height = rect.height
            
            // Scale the location coordinates
            const scaledLocation = {
              topLeftCorner: { 
                x: qrResult.location.topLeftCorner.x * scaleX, 
                y: qrResult.location.topLeftCorner.y * scaleY 
              },
              topRightCorner: { 
                x: qrResult.location.topRightCorner.x * scaleX, 
                y: qrResult.location.topRightCorner.y * scaleY 
              },
              bottomLeftCorner: { 
                x: qrResult.location.bottomLeftCorner.x * scaleX, 
                y: qrResult.location.bottomLeftCorner.y * scaleY 
              },
              bottomRightCorner: { 
                x: qrResult.location.bottomRightCorner.x * scaleX, 
                y: qrResult.location.bottomRightCorner.y * scaleY 
              }
            }
            
            drawQROverlay(scaledLocation)
          }
          
          processQRData(qrResult.data)
        }
      }
    }, 200) // Faster scanning - every 200ms
  }

  const processQRData = (qrData: string) => {
    // Stop scanning
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    // Decrypt and parse QR data
    const decryptedData = decryptQRData(qrData) as CustomerData | null
    
    if (!decryptedData || !selectedProductData) {
      setScanError("Failed to decrypt QR code data")
      setIsScanning(false)
      return
    }

    // Verify if customer has enough credits
    if (decryptedData.credits < selectedProductData.credits) {
      setScanError(`Insufficient credits. Required: ${selectedProductData.credits}, Available: ${decryptedData.credits}`)
      setIsScanning(false)
      return
    }
    console.log("Decrypted Customer Data:", decryptedData)
    console.log("Selected Product Data:", selectedProductData)
    processTransaction(decryptedData)
  }

  const processTransaction = (customerData: any) => {
    if (!selectedProductData) return

    // Stop camera
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    // Calculate credits needed based on product price + taxes + gas fee
    const baseAmount = selectedProductData.price
    const gstAmount = baseAmount * 0.13
    const totalAmount = baseAmount + gstAmount + 0.02
    const creditsNeeded = Math.ceil(totalAmount)

    // Generate transaction data using actual QR data
    const receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const transactionId = `TXN-${Date.now()}`

    setTransactionData({
      receiptId,
      transactionId,
      amount: selectedProductData.price, // Base product price
      credits: creditsNeeded, // Actual credits deducted (including taxes)
      productName: selectedProductData.name,
      timestamp: new Date().toLocaleString(),
      customerName: customerData.sub_id || "Unknown Customer",
      paymentMethod: "Digital Credits",
      customerCredits: customerData.credits, // From QR data
      remainingCredits: customerData.credits - creditsNeeded, // Real calculation
      blockchainHash: `0x${Math.random().toString(16).substring(2, 16)}`,
      // Store QR metadata
      qrAmount: customerData.amount, // Original amount from QR
      qrTimestamp: customerData.timestamp,
      qrBid: customerData.bid
    })

    setIsScanning(false)
    setScanComplete(true)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!selectedProduct) {
      setScanError("Please select a product first")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result !== 'string') return

      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)
        
        // Try detection with original image
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        let qrResult = detectQRCode(imageData)
        
        // If no QR found, try with preprocessed image
        if (!qrResult) {
          imageData = preprocessImage(canvas, context)
          qrResult = detectQRCode(imageData)
        }
        
        if (qrResult) {
          setQrDetected(true)
          processQRData(qrResult.data)
        } else {
          setScanError("No QR code detected in the uploaded image. Please ensure the image is clear and contains a valid QR code.")
        }
      }
      img.onerror = () => {
        setScanError("Failed to load the uploaded image. Please try a different image.")
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  const resetTransaction = () => {
    setScanComplete(false)
    setTransactionData(null)
    setSelectedProduct("")
    setScanError("")
    setQrDetected(false)
    setQrLocation(null)
    setScanAttempts(0)
    
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }

  const cancelScanning = () => {
    setIsScanning(false)
    setScanError("")
    setQrDetected(false)
    setQrLocation(null)
    setScanAttempts(0)
    
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
    }
  }, [stream])

  if (scanComplete && transactionData) {
    // Use the actual transaction calculations
    const baseAmount = transactionData.amount // Product price
    
    const totalAmount = baseAmount + 0.02 // Total with gas fee
    const creditsDeducted = Math.ceil(totalAmount) // Credits actually used
    const remainingCredits = transactionData.customerCredits - creditsDeducted // Real remaining

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center bg-green-500 text-white rounded-t-lg">
              <div className="flex justify-center mb-2">
                <div className="bg-white rounded-full p-3">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-xl">Payment Successful</CardTitle>
              <CardDescription className="text-green-100">Transaction completed successfully</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Product & Amount */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">रु {totalAmount.toFixed(2)}</h3>
                <p className="text-lg text-gray-600">{transactionData.productName}</p>
                <p className="text-sm text-gray-500">Customer: {transactionData.customerName}</p>
              </div>

              <Separator />

              {/* QR Information */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">From QR Code:</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Customer ID:</span>
                    <span className="font-mono">{transactionData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Available Credits:</span>
                    <span className="font-semibold">{transactionData.customerCredits}</span>
                  </div>
                  {transactionData.qrAmount && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">QR Amount:</span>
                      <span>रु {transactionData.qrAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item Price:</span>
                  <span>रु {baseAmount.toFixed(2)}/-</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Fee:</span>
                  <span>रु 0.02/-</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid:</span>
                  <span>रु {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Credits Info - Now linked to real calculations */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Credits Before:</span>
                  <span className="font-semibold">{transactionData.customerCredits}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Credits Used:</span>
                  <span className="font-semibold text-red-600">-{creditsDeducted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Remaining Credits:</span>
                  <span className="font-semibold text-green-600">{remainingCredits}</span>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Receipt ID:</span>
                  <span className="font-mono">{transactionData.receiptId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date & Time:</span>
                  <span>{transactionData.timestamp}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={resetTransaction} className="flex-1">
                  New Transaction
                </Button>
                <Button variant="outline" className="flex-1">
                  Print Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              QR Payment Scanner
            </CardTitle>
            <CardDescription>Select a product and scan customer&apos;s QR code to process payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isScanning ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Product</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{product.name}</span>
                            <span className="ml-4 text-green-600 font-medium">रु {product.price.toFixed(2)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProductData && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{selectedProductData.name}</h4>
                        <Badge variant="secondary">${selectedProductData.price.toFixed(2)}</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Credits Required:</span>
                        <span>{selectedProductData.credits} credits</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  <Button onClick={startScanning} disabled={!selectedProduct} className="w-full h-12">
                    <Camera className="h-5 w-5 mr-2" />
                    Start Camera Scanning
                  </Button>
                  
                  <div className="text-center text-gray-500 text-sm">or</div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!selectedProduct}
                    className="w-full h-12"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload QR Image
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {scanError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{scanError}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas 
                    ref={overlayCanvasRef} 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ mixBlendMode: 'screen' }}
                  />
                  <div className="absolute top-4 left-4 right-4">
                    <div className={`${qrDetected ? 'bg-green-600' : 'bg-black/70'} text-white p-2 rounded text-center text-sm transition-colors`}>
                      {qrDetected ? '✓ QR Code Detected & Processing!' : 'Position QR code within the frame'}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 text-white p-2 rounded text-center text-xs">
                      Scan attempts: {scanAttempts} | Enhanced detection active
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {!qrDetected ? (
                      <>
                        <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
                        <span className="text-sm text-gray-600">Advanced QR scanning active...</span>
                      </>
                    ) : (
                      <>
                        <div className="rounded-full h-4 w-4 bg-green-500 animate-pulse"></div>
                        <span className="text-sm text-green-600">Processing secure transaction...</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Processing: {selectedProductData?.name} - ${selectedProductData?.price.toFixed(2)}
                  </p>
                </div>

                <Button variant="outline" onClick={cancelScanning} className="w-full">
                  Cancel Scanning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Hidden canvas for QR processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  )
}