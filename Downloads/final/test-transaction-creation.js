// Test script to create transactions with existing users
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function createTestTransactions() {
  try {
    console.log('🚀 Testing transaction creation...');
    
    // Try to login with existing users first
    let userToken, businessToken;
    
    try {
      const userLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'testuser@example.com',
        password: 'password123'
      });
      userToken = userLogin.data.token;
      console.log('✅ User logged in successfully');
    } catch (error) {
      console.log('⚠️ User login failed, creating new user...');
      const userResponse = await axios.post(`${API_BASE}/auth/register`, {
        name: 'Test User 2',
        email: 'testuser2@example.com',
        password: 'password123',
        role: 'user'
      });
      userToken = userResponse.data.token;
      console.log('✅ New user created and logged in');
    }
    
    try {
      const businessLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'testbusiness@example.com',
        password: 'password123'
      });
      businessToken = businessLogin.data.token;
      console.log('✅ Business logged in successfully');
    } catch (error) {
      console.log('⚠️ Business login failed, creating new business...');
      const businessResponse = await axios.post(`${API_BASE}/auth/register`, {
        name: 'Test Business 2',
        email: 'testbusiness2@example.com',
        password: 'password123',
        role: 'business',
        businessType: 'retail'
      });
      businessToken = businessResponse.data.token;
      console.log('✅ New business created and logged in');
    }
    
    // Get or create user wallet
    let userWallet;
    try {
      const walletResponse = await axios.get(`${API_BASE}/wallet`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      userWallet = walletResponse.data.data;
      console.log('✅ User wallet found:', userWallet.address);
    } catch (error) {
      const walletResponse = await axios.post(`${API_BASE}/wallet`, {
        privateKey: 'user-private-key-' + Date.now()
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      userWallet = walletResponse.data.data;
      console.log('✅ User wallet created:', userWallet.address);
    }
    
    // Get or create business wallet
    let businessWallet;
    try {
      const walletResponse = await axios.get(`${API_BASE}/wallet`, {
        headers: { Authorization: `Bearer ${businessToken}` }
      });
      businessWallet = walletResponse.data.data;
      console.log('✅ Business wallet found:', businessWallet.address);
    } catch (error) {
      const walletResponse = await axios.post(`${API_BASE}/wallet`, {
        privateKey: 'business-private-key-' + Date.now()
      }, {
        headers: { Authorization: `Bearer ${businessToken}` }
      });
      businessWallet = walletResponse.data.data;
      console.log('✅ Business wallet created:', businessWallet.address);
    }
    
    // Create a transaction
    console.log('💸 Creating transaction...');
    const transactionData = {
      toAddress: businessWallet.address,
      amount: 25,
      encryptedPrivateKey: userWallet.privateKey || 'user-private-key-' + Date.now()
    };
    
    console.log('Transaction data:', transactionData);
    
    const transactionResponse = await axios.post(`${API_BASE}/transactions`, transactionData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Transaction created successfully!');
    console.log('Transaction details:', transactionResponse.data);
    
    // Check user's transaction history
    const userTransactionsResponse = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log(`✅ User has ${userTransactionsResponse.data.count} transactions`);
    
    // Check business's transaction history
    const businessTransactionsResponse = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    console.log(`✅ Business has ${businessTransactionsResponse.data.count} transactions`);
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
  }
}

createTestTransactions();
