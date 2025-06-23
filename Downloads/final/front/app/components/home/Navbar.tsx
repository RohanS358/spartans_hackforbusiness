'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  onSignIn?: () => void
  onSignUp?: () => void
}

export default function Navbar({ onSignIn, onSignUp }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  const handleDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LocalConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                How It Works
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                  <Button
                    onClick={handleDashboard}
                    variant="outline"
                    size="sm"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={onSignIn}
                    variant="ghost"
                    size="sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={onSignUp}
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link href="#features" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
              How It Works
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Dashboard
              </Link>
            )}
            <div className="border-t pt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-700">Welcome, {user.name}</div>
                  <Button
                    onClick={handleDashboard}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={onSignIn}
                    variant="ghost"
                    size="sm"
                    className="w-full mb-2"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={onSignUp}
                    size="sm"
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
