"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import TransactionTest from "./TransactionTest"

export default function TransactionForm() {
  const { createTransaction } = useAuth()
  const { toast } = useToast()
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [productId, setProductId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("Sending transaction to: ", `${process.env.NEXT_PUBLIC_API_URL}/api/transactions`)
      
      // Check if we have an API URL configured
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error("NEXT_PUBLIC_API_URL environment variable is not set")
        throw new Error("API URL not configured. Please check your environment variables.")
      }
      
      // Show initial toast
      toast({
        title: "🚀 Transaction Starting",
        description: `Sending $${amount} to ${toAddress.slice(0, 10)}...${toAddress.slice(-4)}`,
      })
      
      const result = await createTransaction(
        toAddress,
        Number(amount),
        privateKey,
        productId || undefined
      )
      console.log("Transaction successful:", result)
      
      // Show success toast with more details
      const txHash = result.data?.transaction?.hash || 'unknown'
      toast({
        title: "✅ Transaction Successful!",
        description: `Sent $${amount} to ${toAddress.slice(0, 10)}...${toAddress.slice(-4)}. Hash: ${txHash.slice(0, 8)}...`,
      })
      
      setSuccess(`Transaction successful! Hash: ${txHash}`)
      // Reset form
      setToAddress("")
      setAmount("")
      setPrivateKey("")
      setProductId("")
    } catch (error: any) {
      console.error("Transaction error:", error)
      const errorMessage = error.message || "Transaction failed"
      setError(errorMessage)
      
      // Show error toast
      toast({
        title: "❌ Transaction Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Send Transaction</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Recipient Address
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Your Private Key
          </label>
          <input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your private key is never sent to our servers and is only used to sign the transaction
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Product ID (optional)
          </label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Send Transaction"}
        </button>
      </form>
      
      <div className="mt-8 border-t pt-6">
        <TransactionTest />
      </div>
    </div>
  )
}
