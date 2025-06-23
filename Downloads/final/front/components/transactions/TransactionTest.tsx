"use client"

import { useState } from "react"

export default function TransactionTest() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testDirectRequest = async () => {
    setLoading(true)
    setResult("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setResult("No token found. Please log in first.")
        return
      }

      // Sample transaction data
      const payload = {
        toAddress: "sample-address-123",
        amount: 10,
        encryptedPrivateKey: "sample-key-456"
      }

      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        data = { text }
      }

      setResult(`Status: ${response.status}\nHeaders: ${JSON.stringify([...response.headers])}\nData: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`Error: ${error.message}\nStack: ${error.stack}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">API Test</h3>
      <button
        onClick={testDirectRequest}
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Testing..." : "Test Direct API Request"}
      </button>
      
      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded overflow-auto max-h-96 text-xs">
          {result}
        </pre>
      )}
    </div>
  )
}
