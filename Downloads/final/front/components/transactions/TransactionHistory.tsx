"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { ArrowUpRight, ArrowDownLeft, Clock, Check, X, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Transaction {
  _id: string
  type: 'incoming' | 'outgoing'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  confirmations: number
  productName?: string
  fromAddress: string
  toAddress: string
  hash: string
  createdAt: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.get('/api/transactions')
      setTransactions(data.data)
    } catch (err) {
      console.error("Error loading transactions:", err)
      setError("Failed to load transactions")
      toast({
        title: "Error",
        description: "Could not load transaction history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const getStatusBadge = (status: string, confirmations: number) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <Check className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            {confirmations > 0 ? `${confirmations}/6 confirmations` : 'Pending'}
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <X className="h-3 w-3 mr-1" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading && transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-gray-200" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={loadTransactions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Transaction History</CardTitle>
        <Button 
          onClick={loadTransactions} 
          variant="ghost" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No transactions found
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div 
                key={tx._id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    tx.type === 'incoming' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {tx.type === 'incoming' ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {tx.productName || (tx.type === 'incoming' ? 'Received' : 'Payment')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {tx.type === 'incoming' 
                        ? `From: ${formatAddress(tx.fromAddress)}` 
                        : `To: ${formatAddress(tx.toAddress)}`}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 cursor-help">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tx Hash: {formatAddress(tx.hash)}</p>
                        <p>Block: {tx.confirmations} confirmations</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    tx.type === 'incoming' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toFixed(2)}
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(tx.status, tx.confirmations)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}