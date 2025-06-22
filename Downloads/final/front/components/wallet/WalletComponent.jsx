"use client"

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export default function WalletComponent() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchWallet();
  }, []);
  
  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWallet();
      setWallet(response.data);
      setError(null);
    } catch (err) {
      setError("No wallet found. Create one to get started.");
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateWallet = async () => {
    try {
      setLoading(true);
      // Create wallet with auto-generated private key
      const response = await apiClient.createWallet();
      setWallet(response.data);
      setError(null);
      alert("Wallet created successfully!");
    } catch (err) {
      setError(err.message || "Failed to create wallet");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="wallet-container">
      <h2>Your Wallet</h2>
      
      {loading && <p>Loading...</p>}
      
      {error && !wallet && (
        <div>
          <p className="error">{error}</p>
          <button 
            onClick={handleCreateWallet}
            disabled={loading}
          >
            Create New Wallet
          </button>
        </div>
      )}
      
      {wallet && (
        <div className="wallet-info">
          <p><strong>Address:</strong> {wallet.address}</p>
          <p><strong>Balance:</strong> {wallet.balance} tokens</p>
          <button onClick={fetchWallet}>Refresh Balance</button>
        </div>
      )}
    </div>
  );
}