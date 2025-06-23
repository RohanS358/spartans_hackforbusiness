// Test script to create some transactions for frontend testing
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFrontendTransactions() {
  try {
    console.log('🚀 Creating test transactions for frontend...');
    
    // 1. Register a user
    const userResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    });
    const userToken = userResponse.data.token;
    console.log('✅ User registered and logged in');
    
    // 2. Register a business
    const businessResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Business',
      email: 'testbusiness@example.com',
      password: 'password123',
      role: 'business',
      businessType: 'retail'
    });
    const businessToken = businessResponse.data.token;
    console.log('✅ Business registered and logged in');
    
    // 3. Create user wallet
    const userWalletResponse = await axios.post(`${API_BASE}/wallet`, {
      privateKey: 'user-private-key-123'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const userWallet = userWalletResponse.data.data;
    console.log('✅ User wallet created:', userWallet.address);
    
    // 4. Create business wallet
    const businessWalletResponse = await axios.post(`${API_BASE}/wallet`, {
      privateKey: 'business-private-key-123'
    }, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    const businessWallet = businessWalletResponse.data.data;
    console.log('✅ Business wallet created:', businessWallet.address);
    
    // 5. Create some transactions from user to business
    for (let i = 1; i <= 3; i++) {
      try {
        const transactionResponse = await axios.post(`${API_BASE}/transactions`, {
          toAddress: businessWallet.address,
          amount: 10 + i * 5,
          encryptedPrivateKey: 'user-private-key-123'
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log(`✅ Transaction ${i} created:`, transactionResponse.data.data.transaction.hash);
      } catch (error) {
        console.log(`❌ Transaction ${i} failed:`, error.response?.data?.message || error.message);
      }
    }
    
    // 6. Check user's transaction history
    const userTransactionsResponse = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log(`✅ User has ${userTransactionsResponse.data.count} transactions`);
    
    // 7. Check business's transaction history
    const businessTransactionsResponse = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    console.log(`✅ Business has ${businessTransactionsResponse.data.count} transactions`);
    
    // 8. Check blockchain stats
    const blockchainStatsResponse = await axios.get(`${API_BASE}/blockchain/stats`);
    console.log('📊 Blockchain Stats:', blockchainStatsResponse.data);
    
    console.log('🎉 Frontend test data created successfully!');
    console.log('💡 You can now test the frontend at http://localhost:3000');
    console.log('🔑 User login: testuser@example.com / password123');
    console.log('🏢 Business login: testbusiness@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendTransactions();
