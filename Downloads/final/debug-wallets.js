// Debug script to check available wallets
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function debugWallets() {
  try {
    console.log('🔍 Debugging wallet addresses...');
    
    // Login as one of our test users to get access
    const userLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser_1750650648221@example.com',
      password: 'password123'
    });
    const token = userLogin.data.token;
    console.log('✅ Logged in successfully');
    
    // Get all wallets
    const walletsResponse = await axios.get(`${API_BASE}/wallet/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
      console.log(`\n📋 Found ${walletsResponse.data.count} wallets:`);
    walletsResponse.data.data.forEach((wallet, index) => {
      console.log(`${index + 1}. Address: ${wallet.address}`);
      console.log(`   Owner ID: ${wallet.owner?.name || 'N/A'} (${wallet.owner?.email || 'N/A'})`);
      console.log(`   Type: ${wallet.ownerModel}`);
      console.log(`   Balance: $${wallet.balance}`);
      console.log(`   Created: ${new Date(wallet.createdAt).toLocaleString()}`);
      console.log('');
    });
    
    // Show a simple copy-paste example with the first two different types
    if (walletsResponse.data.data.length >= 2) {
      const userWallet = walletsResponse.data.data.find(w => w.ownerModel === 'User');
      const businessWallet = walletsResponse.data.data.find(w => w.ownerModel === 'Business');
      
      console.log('💡 Example addresses you can use for testing:');
      if (userWallet) {
        console.log(`User wallet: ${userWallet.address}`);
      }
      if (businessWallet) {
        console.log(`Business wallet: ${businessWallet.address}`);
      }
      
      console.log('\n🎯 To test a transaction:');
      console.log('1. Login to the frontend with your credentials');
      console.log('2. Copy one of the above addresses as recipient');
      console.log('3. Send a small amount (like $5)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugWallets();
