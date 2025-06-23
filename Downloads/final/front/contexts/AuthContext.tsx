"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "individual" | "business"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  loading: boolean
  createTransaction: (toAddress: string, amount: number, privateKey: string, productId?: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // Verify token and get user data
      fetchUserData(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    const data = await response.json()
    localStorage.setItem("token", data.token)
    setUser(data.user)
  }

  const register = async (userData: any) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    const data = await response.json()
    localStorage.setItem("token", data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  // Function to create a blockchain transaction
  const createTransaction = async (toAddress: string, amount: number, privateKey: string, productId?: string) => {
    const token = localStorage.getItem("token")
    
    if (!token) {
      throw new Error("You must be logged in to make transactions")
    }
    
    // Make sure we have a valid API URL
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error("NEXT_PUBLIC_API_URL environment variable is not set")
      throw new Error("API URL not configured")
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/transactions`
    console.log("Sending POST request to:", apiUrl)
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          toAddress,
          amount,
          encryptedPrivateKey: privateKey,
          productId: productId || undefined
        })
      })

      console.log("Response status:", response.status)
      
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }
        return { success: true, data: { transaction: { hash: "unknown" } } }
      }

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || data.error || "Transaction failed")
      }

      return data
    } catch (error: any) {
      console.error("Transaction request failed:", error)
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error("Cannot connect to the server. Please check your network connection.")
      }
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading, createTransaction }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
