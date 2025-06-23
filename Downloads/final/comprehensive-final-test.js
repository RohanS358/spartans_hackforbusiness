// Final comprehensive test for the transaction system
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function comprehensiveTest() {
  try {
    console.log('🚀 Starting comprehensive transaction system test...');
    
    // 1. Create fresh test users
    const timestamp = Date.now();
    const userEmail = `testuser_${timestamp}@example.com`;
    const businessEmail = `testbusiness_${timestamp}@example.com`;
    
    console.log('1️⃣ Creating fresh test users...');
    
    // Register user
    const userResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Fresh Test User',
      email: userEmail,
      password: 'password123',
      role: 'user'
    });
    const userToken = userResponse.data.token;
    console.log('✅ User registered:', userEmail);
    
    // Register business
    const businessResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Fresh Test Business',
      email: businessEmail,
      password: 'password123',
      role: 'business',
      businessType: 'retail'
    });
    const businessToken = businessResponse.data.token;
    console.log('✅ Business registered:', businessEmail);
    
    // 2. Create wallets
    console.log('2️⃣ Creating wallets...');
    
    const userWalletResponse = await axios.post(`${API_BASE}/wallet`, {
      privateKey: 'user-private-key-' + timestamp
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const userWallet = userWalletResponse.data.data;
    console.log('✅ User wallet created:', userWallet.address);
    console.log('💰 User balance:', userWallet.balance);
    
    const businessWalletResponse = await axios.post(`${API_BASE}/wallet`, {
      privateKey: 'business-private-key-' + timestamp
    }, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    const businessWallet = businessWalletResponse.data.data;
    console.log('✅ Business wallet created:', businessWallet.address);
    console.log('💰 Business balance:', businessWallet.balance);
    
    // 3. Create a transaction
    console.log('3️⃣ Creating transaction...');
    
    const transactionData = {
      toAddress: businessWallet.address,
      amount: 15,
      encryptedPrivateKey: 'user-private-key-' + timestamp
    };
    
    const transactionResponse = await axios.post(`${API_BASE}/transactions`, transactionData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Transaction created successfully!');
    console.log('📋 Transaction details:', JSON.stringify(transactionResponse.data, null, 2));
    
    // 4. Check transaction histories
    console.log('4️⃣ Checking transaction histories...');
    
    const userTransactionsResponse = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log(`✅ User has ${userTransactionsResponse.data.count} transactions`);
    
    const businessTransactionsResponse = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    console.log(`✅ Business has ${businessTransactionsResponse.data.count} transactions`);
    
    // 5. Check blockchain stats
    console.log('5️⃣ Checking blockchain stats...');
    
    const blockchainStatsResponse = await axios.get(`${API_BASE}/blockchain/stats`);
    console.log('📊 Blockchain Stats:', JSON.stringify(blockchainStatsResponse.data, null, 2));
    
    const blocksResponse = await axios.get(`${API_BASE}/blockchain/blocks`);
    console.log(`🧱 Total blocks in database: ${blocksResponse.data.count}`);
    
    console.log('🎉 All tests passed! The transaction system is working properly.');
    console.log('');
    console.log('🌐 You can now test the frontend at: http://localhost:3000');
    console.log('🔑 Fresh User credentials:');
    console.log(`   Email: ${userEmail}`);
    console.log(`   Password: password123`);
    console.log('🏢 Fresh Business credentials:');
    console.log(`   Email: ${businessEmail}`);
    console.log(`   Password: password123`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
  }
}

comprehensiveTest();
