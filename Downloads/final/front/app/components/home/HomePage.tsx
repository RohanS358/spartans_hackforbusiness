'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import SimpleLoginForm from '@/components/auth/SimpleLoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from './Navbar'
import MapBackground from './MapBackground'
import StatsSection from './StatsSection'
import FeaturesSection from './FeaturesSection'
import HowItWorksSection from './HowItWorksSection'

export default function HomePage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalTransactions: 0,
    totalCreditsIssued: 0
  })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authType, setAuthType] = useState<'login' | 'register'>('login')
  const [userType, setUserType] = useState<'user' | 'business'>('user')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Try to load real stats from the API
      const [businesses, transactions] = await Promise.all([
        apiClient.getBusinesses().catch(() => []),
        apiClient.get('/api/blockchain/stats').catch(() => ({ 
          totalTransactions: 0, 
          totalUsers: 0, 
          totalCreditsIssued: 0 
        }))
      ])

      setStats({
        totalUsers: transactions.totalUsers || 15420,
        totalBusinesses: businesses.length || 1250,
        totalTransactions: transactions.totalTransactions || 45680,
        totalCreditsIssued: transactions.totalCreditsIssued || 2340000
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      // Fallback to simulated stats
      setStats({
        totalUsers: 15420,
        totalBusinesses: 1250,
        totalTransactions: 45680,
        totalCreditsIssued: 2340000
      })
    }
  }
  const handleSignIn = () => {
    setAuthType('login')
    setUserType('user')
    setShowAuthModal(true)
  }

  const handleSignUp = () => {
    setAuthType('register')
    setUserType('user')
    setShowAuthModal(true)
  }
  const handleExploreBusinesses = () => {
    router.push('/explore')
  }

  const handleJoinAsBusiness = () => {
    setAuthType('register')
    setUserType('business')
    setShowAuthModal(true)
  }

  const handleGetStarted = () => {
    setAuthType('register')
    setUserType('user')
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSignIn={handleSignIn} onSignUp={handleSignUp} />
      
      {/* Hero Section with Map Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <MapBackground />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in">
            Discover Local
            <span className="text-blue-400 block">Businesses</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-delay">
            Build real relationships with local businesses through our unique credit system. 
            Each business has its own rewards, loyalty programs, and exclusive perks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <Button 
              onClick={handleExploreBusinesses}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Explore Businesses
            </Button>
            <Button 
              onClick={handleJoinAsBusiness}
              variant="outline"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Join as Business
            </Button>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/70 z-0"></div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />      {/* Features Section */}
      <div id="features">
        <FeaturesSection />
      </div>

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorksSection />
      </div>

      {/* Call to Action */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users discovering amazing local businesses and earning exclusive rewards.
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LocalConnect</h3>
              <p className="text-gray-400">
                Connecting communities through local business relationships and blockchain-powered trust.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Users</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Discover Businesses</li>
                <li>Earn Credits</li>
                <li>Get Exclusive Deals</li>
                <li>Join Loyalty Programs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Businesses</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Create Credit System</li>
                <li>Manage Customers</li>
                <li>Track Analytics</li>
                <li>Boost Engagement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LocalConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authType === 'login' ? 'Sign In' : 'Sign Up'} 
              {userType === 'business' ? ' as Business' : ' as User'}
            </DialogTitle>
          </DialogHeader>          <div className="space-y-4">
            {authType === 'login' ? (
              <SimpleLoginForm onSuccess={() => setShowAuthModal(false)} />
            ) : (
              <RegisterForm 
                userType={userType}
                onSuccess={() => setShowAuthModal(false)}
                onSwitchToLogin={() => setAuthType('login')}
              />
            )}
            <div className="text-center text-sm text-gray-600">
              {authType === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setAuthType('register')}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setAuthType('login')}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
