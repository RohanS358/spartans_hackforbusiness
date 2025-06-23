// Frontend integration test for UI components
const axios = require('axios');
const API_BASE = 'http://localhost:5000/api';

async function testFrontendIntegration() {
  console.log('🎨 Testing Frontend Integration...\n');

  try {
    // Create test data for frontend
    const timestamp = Date.now();
    
    console.log('1️⃣  Creating test accounts for frontend...');
    const userResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: `frontenduser_${timestamp}@example.com`,
      password: 'password123',
      name: 'Frontend Test User',
      role: 'user'
    });
    console.log('✅ User created for frontend testing');

    const businessResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: `frontendbiz_${timestamp}@example.com`,
      password: 'password123',
      name: 'Frontend Test Business',
      role: 'business'
    });
    console.log('✅ Business created for frontend testing');

    // Create wallets
    console.log('\n2️⃣  Creating wallets...');
    const userWallet = await axios.post(`${API_BASE}/wallet`, {
      privateKey: 'frontend_user_private_key'
    }, {
      headers: { Authorization: `Bearer ${userResponse.data.token}` }
    });
    console.log(`✅ User wallet: ${userWallet.data.data.address}`);

    const businessWallet = await axios.post(`${API_BASE}/wallet`, {
      privateKey: 'frontend_business_private_key'
    }, {
      headers: { Authorization: `Bearer ${businessResponse.data.token}` }
    });
    console.log(`✅ Business wallet: ${businessWallet.data.data.address}`);

    // Create multiple transactions for testing transaction history
    console.log('\n3️⃣  Creating multiple transactions for frontend testing...');
    const transactions = [];
    
    for (let i = 1; i <= 3; i++) {
      const tx = await axios.post(`${API_BASE}/transactions`, {
        toAddress: businessWallet.data.data.address,
        amount: 10 + i,
        encryptedPrivateKey: 'frontend_user_private_key'
      }, {
        headers: { Authorization: `Bearer ${userResponse.data.token}` }
      });
      transactions.push(tx.data.data.transaction);
      console.log(`✅ Transaction ${i}: $${10 + i} sent`);
    }

    // Get transaction history
    console.log('\n4️⃣  Testing transaction history endpoint...');    const userHistory = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${userResponse.data.token}` }
    });
    console.log(`✅ User transaction history: ${userHistory.data.data.length} transactions`);

    const businessHistory = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${businessResponse.data.token}` }
    });
    console.log(`✅ Business transaction history: ${businessHistory.data.data.length} transactions`);

    // Test business listing for explore page
    console.log('\n5️⃣  Testing business listing for explore page...');    const businesses = await axios.get(`${API_BASE}/business/all`);
    console.log(`✅ Public businesses: ${businesses.data.data.length} found`);

    // Final balances
    console.log('\n6️⃣  Final balances after all transactions...');
    const finalUserWallet = await axios.get(`${API_BASE}/wallet`, {
      headers: { Authorization: `Bearer ${userResponse.data.token}` }
    });
    
    const finalBusinessWallet = await axios.get(`${API_BASE}/wallet`, {
      headers: { Authorization: `Bearer ${businessResponse.data.token}` }
    });

    console.log(`💰 User final balance: $${finalUserWallet.data.data.balance}`);
    console.log(`💰 Business final balance: $${finalBusinessWallet.data.data.balance}`);

    console.log('\n🎉 Frontend Integration Test PASSED!');
    console.log('\n🎯 Frontend Test Data Created:');
    console.log(`👤 User Login: frontenduser_${timestamp}@example.com / password123`);
    console.log(`🏢 Business Login: frontendbiz_${timestamp}@example.com / password123`);
    console.log(`📱 User Wallet: ${userWallet.data.data.address}`);
    console.log(`🏪 Business Wallet: ${businessWallet.data.data.address}`);
    console.log(`💳 Transactions Created: ${transactions.length}`);
    
    console.log('\n🌐 Frontend Testing URLs:');
    console.log('   🏠 Homepage: http://localhost:3001');
    console.log('   🔐 Dashboard: http://localhost:3001/dashboard');
    console.log('   📊 Explore: http://localhost:3001/explore');
    console.log('   📱 QR Payment: http://localhost:3001/qr-payment');

  } catch (error) {
    console.error('❌ Frontend integration test failed:', error.response?.data || error.message);
  }
}

testFrontendIntegration();
