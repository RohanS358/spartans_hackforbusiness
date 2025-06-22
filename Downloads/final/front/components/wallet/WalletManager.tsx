"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Wallet, Send, Plus, Key, QrCode } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface WalletData {
  address: string
  balance: number
  qrCode?: string
}

interface WalletManagerProps {
  onBalanceUpdate: () => void
}

// QR Scanner Component
function QrScanner({ onScan, onClose }: { onScan: (data: string) => void; onClose: () => void }) {
  // Simplified for now - in a real app, this would use a camera API
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
        <p className="mb-4">Camera access would be requested here...</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onScan("localbiz:dummyaddress123|product456")}>
            Simulate Scan
          </Button>
        </div>
      </div>
    </div>
  );
}

// Transfer Form Component
function TransferForm({ onSuccess }: { onSuccess?: () => void }) {
  const [transferData, setTransferData] = useState({
    recipientAddress: '',
    amount: '',
    productId: ''
  })
  const [showScanner, setShowScanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setTransferData(prev => ({ ...prev, [name]: value }))
  }

  const handleScan = (data: string) => {
    try {
      // QR format: "localbiz:<address>|<productId>"
      const [address, productId] = data.split('|')
      setTransferData(prev => ({
        ...prev,
        recipientAddress: address.replace('localbiz:', ''),
        productId: productId || ''
      }))
      setShowScanner(false)
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "Please scan a valid payment QR code",
        variant: "destructive"
      })
    }
  }

  const handleTransfer = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // In a real app, you'd get the private key from secure storage
      // For now, we'll simulate this
      const encryptedPrivateKey = localStorage.getItem('walletPrivateKey') || 'simulated-key'
      
      await apiClient.transferFunds(
        transferData.recipientAddress, 
        Number(transferData.amount)
      )

      toast({
        title: "Transaction Submitted",
        description: "Your transaction is being processed on the blockchain",
      })

      setTransferData({
        recipientAddress: '',
        amount: '',
        productId: ''
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Transfer failed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleTransfer} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recipientAddress">Recipient Address</Label>
        <div className="flex gap-2">
          <Input
            id="recipientAddress"
            name="recipientAddress"
            value={transferData.recipientAddress}
            onChange={handleChange}
            placeholder="Wallet address or scan QR"
            required
            className="border-green-300 focus:border-green-500"
          />
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowScanner(true)}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scan
          </Button>
        </div>
      </div>

      {transferData.productId && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          Product ID: {transferData.productId}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={transferData.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
          className="border-green-300 focus:border-green-500"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700" 
        disabled={loading}
      >
        <Send className="mr-2 h-4 w-4" />
        {loading ? 'Processing...' : 'Transfer Funds'}
      </Button>

      {showScanner && (
        <QrScanner 
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </form>
  )
}

export default function WalletManager({ onBalanceUpdate }: WalletManagerProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [privateKey, setPrivateKey] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadWallet()
  }, [])

  const loadWallet = async () => {
    try {
      const response = await apiClient.getWallet();
      
      // Check if the response has the expected structure
      if (response.success && response.data) {
        setWallet({
          address: response.data.address,
          balance: response.data.balance
        });
      } else {
        throw new Error("Invalid wallet data structure");
      }
    } catch (error) {
      console.error("Error loading wallet:", error);
      // Don't set wallet to null here - keep previous state if any
    }
  }

  const createWallet = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const response = await apiClient.createWallet(privateKey || undefined)
      
      // Check if the response has the expected structure
      if (response.success && response.data) {
        setWallet({
          address: response.data.address,
          balance: response.data.balance,
          qrCode: response.data.qrCode
        });
        
        // Store the private key securely (in a real app, use a better approach)
        if (response.data.privateKey) {
          localStorage.setItem('walletPrivateKey', response.data.privateKey);
        }
        
        onBalanceUpdate()
        setIsDialogOpen(false)
        setPrivateKey("")
        toast({
          title: "Success",
          description: "Wallet created successfully!",
        })
      } else {
        throw new Error("Invalid wallet data structure");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create wallet",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTransferSuccess = () => {
    loadWallet()
    onBalanceUpdate()
  }

  if (!wallet) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Wallet
          </CardTitle>
          <CardDescription className="text-green-600">
            Create your blockchain wallet to start transacting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Your Wallet</DialogTitle>
                <DialogDescription>
                  You can provide your own private key or let us generate one for you.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createWallet} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="privateKey">Private Key (Optional)</Label>
                  <Input
                    id="privateKey"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your private key or leave blank"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    If you leave this blank, a secure random key will be generated for you.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    <Key className="mr-2 h-4 w-4" />
                    {privateKey ? "Use Custom Key" : "Generate Key & Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Your Wallet
          </CardTitle>
          <CardDescription className="text-green-600">Manage your blockchain wallet and transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-green-700">Wallet Address</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input value={wallet.address} readOnly className="font-mono text-sm border-green-300" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(wallet.address)}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                Copy
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-green-700">Balance</Label>
            <div className="text-3xl font-bold text-green-800 mt-1">
              ${typeof wallet.balance === 'number' ? wallet.balance.toFixed(2) : '0.00'}
            </div>
          </div>

          {wallet.qrCode && (
            <div>
              <Label className="text-green-700">QR Code</Label>
              <div className="mt-2 p-4 bg-white rounded-lg border border-green-200 inline-block">
                <img src={wallet.qrCode} alt="Wallet QR Code" className="w-32 h-32" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Send className="mr-2 h-5 w-5" />
            Send Funds
          </CardTitle>
          <CardDescription className="text-green-600">Transfer funds to another wallet address</CardDescription>
        </CardHeader>
        <CardContent>
          <TransferForm onSuccess={handleTransferSuccess} />
        </CardContent>
      </Card>
    </div>
  )
}
