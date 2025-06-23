"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { MapPin, Star, CreditCard, ArrowLeft, Search, Filter } from 'lucide-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

interface Business {
  _id: string
  businessName: string
  businessType: string
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  contactEmail: string
  creditSystem?: {
    rate: number
    minimumPurchase: number
  }
  rating?: number
  totalCreditsIssued?: number
}

export default function ExplorePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const businessTypes = [
    'restaurant', 'retail', 'service', 'healthcare', 'fitness', 
    'entertainment', 'automotive', 'beauty', 'professional', 'other'
  ]

  useEffect(() => {
    loadBusinesses()
  }, [])

  useEffect(() => {
    filterAndSortBusinesses()
  }, [businesses, searchTerm, selectedType, sortBy])

  const loadBusinesses = async () => {
    try {
      const data = await apiClient.getBusinesses()
      setBusinesses(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load businesses',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortBusinesses = () => {
    let filtered = businesses

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(business => business.businessType === selectedType)
    }

    // Sort businesses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.businessName.localeCompare(b.businessName)
        case 'type':
          return a.businessType.localeCompare(b.businessType)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'credits':
          return (b.totalCreditsIssued || 0) - (a.totalCreditsIssued || 0)
        default:
          return 0
      }
    })

    setFilteredBusinesses(filtered)
  }

  const handleBusinessSelect = (business: Business) => {
    if (!user) {
      toast({
        title: 'Please Sign In',
        description: 'You need to sign in to view business details',
        variant: 'destructive',
      })
      router.push('/')
      return
    }

    // Navigate to business details or handle business interaction
    toast({
      title: 'Business Selected',
      description: `You selected ${business.businessName}`,
    })
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href={user ? "/dashboard" : "/"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Explore Businesses</h1>
                <p className="text-gray-600">Discover local businesses and their credit systems</p>
              </div>
            </div>
            {user && (
              <Link href="/dashboard">
                <Button variant="outline">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {businessTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="credits">Credits Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBusinesses.length} of {businesses.length} businesses
            {selectedType !== 'all' && ` in ${selectedType}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Business Grid */}
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-600">
                {businesses.length === 0 
                  ? "No businesses have registered yet. Be the first!"
                  : "Try adjusting your search criteria."
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Card key={business._id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleBusinessSelect(business)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{business.businessName}</CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {business.businessType.charAt(0).toUpperCase() + business.businessType.slice(1)}
                      </Badge>
                    </div>
                    {business.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{business.location.address}</span>
                  </div>

                  {business.creditSystem && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Credit System</span>
                      </div>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>Rate: {business.creditSystem.rate}% cashback</p>
                        <p>Min Purchase: ${business.creditSystem.minimumPurchase}</p>
                      </div>
                    </div>
                  )}

                  {business.totalCreditsIssued && (
                    <div className="text-xs text-gray-500">
                      Total credits issued: {business.totalCreditsIssued.toLocaleString()}
                    </div>
                  )}

                  <Button className="w-full" size="sm">
                    {user ? 'View Details' : 'Sign In to View'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action for Non-Users */}
        {!user && businesses.length > 0 && (
          <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Ready to Start Earning Credits?
            </h3>
            <p className="text-blue-700 mb-6">
              Sign up now to interact with businesses, earn credits, and unlock exclusive rewards.
            </p>
            <Link href="/">
              <Button size="lg">
                Get Started Today
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
