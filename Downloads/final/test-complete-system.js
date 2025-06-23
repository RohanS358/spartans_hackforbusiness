// Complete system integration test
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:3001';

async function testCompleteSystem() {
  console.log('🌟 Testing Complete System Integration...\n');

  try {
    // Test 1: Backend API Health
    console.log('1️⃣  Testing Backend API Health...');
    const healthCheck = await axios.get(`${API_BASE}/blockchain/stats`);    console.log('✅ Backend API is responding');
    console.log(`📊 Blockchain Stats: ${healthCheck.data.totalBlocks} blocks`);

    // Test 2: Frontend Accessibility
    console.log('\n2️⃣  Testing Frontend Accessibility...');
    try {
      const frontendCheck = await axios.get(FRONTEND_BASE);
      console.log('✅ Frontend is accessible');
    } catch (error) {
      console.log('❌ Frontend not accessible:', error.message);
    }

    // Test 3: Create test user and business
    console.log('\n3️⃣  Creating test accounts...');
    const timestamp = Date.now();
    
    const userRegister = await axios.post(`${API_BASE}/auth/register`, {
      email: `testuser_${timestamp}@example.com`,
      password: 'password123',
      name: 'Test User',
      role: 'user'
    });
    console.log('✅ User registered successfully');

    const businessRegister = await axios.post(`${API_BASE}/auth/register`, {
      email: `testbusiness_${timestamp}@example.com`,
      password: 'password123',
      name: 'Test Business',
      role: 'business'
    });
    console.log('✅ Business registered successfully');

    // Test 4: Create wallets
    console.log('\n4️⃣  Creating wallets...');    const userWallet = await axios.post(`${API_BASE}/wallet`, {
      privateKey: 'user_test_private_key'
    }, {
      headers: { Authorization: `Bearer ${userRegister.data.token}` }
    });
    console.log(`✅ User wallet: ${userWallet.data.data.address}`);

    const businessWallet = await axios.post(`${API_BASE}/wallet`, {
      privateKey: 'business_test_private_key'
    }, {
      headers: { Authorization: `Bearer ${businessRegister.data.token}` }
    });
    console.log(`✅ Business wallet: ${businessWallet.data.data.address}`);

    // Test 5: Create transaction
    console.log('\n5️⃣  Creating transaction...');
    const transaction = await axios.post(`${API_BASE}/transactions`, {
      toAddress: businessWallet.data.data.address,
      amount: 25,
      encryptedPrivateKey: 'test_private_key'
    }, {
      headers: { Authorization: `Bearer ${userRegister.data.token}` }
    });
    console.log('✅ Transaction created successfully');
    console.log(`💰 Transaction hash: ${transaction.data.data.transaction.hash}`);

    // Test 6: Check final balances
    console.log('\n6️⃣  Checking final balances...');    const finalUserWallet = await axios.get(`${API_BASE}/wallet`, {
      headers: { Authorization: `Bearer ${userRegister.data.token}` }
    });
    console.log(`💰 User final balance: $${finalUserWallet.data.data.balance}`);

    const finalBusinessWallet = await axios.get(`${API_BASE}/wallet`, {
      headers: { Authorization: `Bearer ${businessRegister.data.token}` }
    });
    console.log(`💰 Business final balance: $${finalBusinessWallet.data.data.balance}`);

    console.log('\n🎉 Complete System Integration Test PASSED!');
    console.log('\n📱 Frontend URLs:');
    console.log(`   🏠 Homepage: ${FRONTEND_BASE}`);
    console.log(`   🔐 Login: ${FRONTEND_BASE}/login`);
    console.log(`   📊 Dashboard: ${FRONTEND_BASE}/dashboard`);
    console.log(`   🔍 Explore: ${FRONTEND_BASE}/explore`);
    console.log(`   📱 QR Payment: ${FRONTEND_BASE}/qr-payment`);
    
    console.log('\n🔑 Test Credentials:');
    console.log(`   👤 User: testuser_${timestamp}@example.com / password123`);
    console.log(`   🏢 Business: testbusiness_${timestamp}@example.com / password123`);

  } catch (error) {
    console.error('❌ System test failed:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('Error details:', error.response.data.error);
    }
  }
}

testCompleteSystem();
