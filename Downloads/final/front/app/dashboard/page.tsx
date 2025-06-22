"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Wallet, Package, TrendingUp, LogOut } from "lucide-react"
import MapView from "@/components/map/MapView"
import WalletManager from "@/components/wallet/WalletManager"
import ProductManager from "@/components/products/ProductManager"
import TransactionHistory from "@/components/transactions/TransactionHistory"
import { apiClient } from "@/lib/api"

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalProducts: 0,
    totalTransactions: 0,
    businessCount: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadDashboardStats()
    }
  }, [user])

  const loadDashboardStats = async () => {
    try {
      const [wallet, products, transactions, businesses] = await Promise.all([
        apiClient.getWallet().catch(() => ({ balance: 0 })),
        apiClient.getProducts().catch(() => []),
        apiClient.getTransactions().catch(() => []),
        apiClient.getBusinesses().catch(() => []),
      ])

      setStats({
        walletBalance: wallet.balance || 0,
        totalProducts: products.length || 0,
        totalTransactions: transactions.length || 0,
        businessCount: businesses.length || 0,
      })
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-green-800">Welcome, {user.name}</h1>
              <p className="text-green-600 capitalize">{user.role} Account</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">${stats.walletBalance.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Products</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{stats.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Businesses</CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{stats.businessCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-green-100">
            <TabsTrigger value="map" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <MapPin className="mr-2 h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Package className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Business Locations</CardTitle>
                <CardDescription className="text-green-600">
                  Explore registered businesses and your location on the map
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <MapView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <WalletManager onBalanceUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductManager onProductUpdate={loadDashboardStats} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
