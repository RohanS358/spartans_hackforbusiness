const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testFullFlow() {
  console.log('🚀 Starting comprehensive full-stack test...\n');

  try {    // Test 1: Check API is running
    console.log('1. Testing API health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/business/all`).catch(() => null);
    if (healthResponse) {
      console.log('✅ API is running');
    } else {
      console.log('❌ API is not responding');
      return;
    }

    // Test 2: Register a test user
    console.log('\n2. Testing user registration...');
    const testUser = {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
    console.log('✅ User registered successfully');
    console.log(`   User ID: ${registerResponse.data.user.id}`);
    
    const userToken = registerResponse.data.token;
    const userId = registerResponse.data.user.id;

    // Test 3: Register a test business
    console.log('\n3. Testing business registration...');
    const testBusiness = {
      name: 'Test Business Owner',
      email: `testbusiness${Date.now()}@example.com`,
      password: 'password123',
      role: 'business',
      businessName: 'Test Local Business',
      businessType: 'restaurant',
      location: {
        address: '123 Test Street, Test City',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    };

    const businessRegisterResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testBusiness);
    console.log('✅ Business registered successfully');
    console.log(`   Business ID: ${businessRegisterResponse.data.user.id}`);
    
    const businessToken = businessRegisterResponse.data.token;
    const businessId = businessRegisterResponse.data.user.id;    // Test 4: Create wallets
    console.log('\n4. Testing wallet creation...');
    const userWalletResponse = await axios.post(`${API_BASE_URL}/api/wallet`, {
      privateKey: 'user-test-private-key-' + Date.now()
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ User wallet created');
    console.log(`   Wallet address: ${userWalletResponse.data.publicKey}`);

    const businessWalletResponse = await axios.post(`${API_BASE_URL}/api/wallet`, {
      privateKey: 'business-test-private-key-' + Date.now()
    }, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    console.log('✅ Business wallet created');
    console.log(`   Wallet address: ${businessWalletResponse.data.publicKey}`);// Test 5: Get businesses list
    console.log('\n5. Testing business discovery...');
    const businessesResponse = await axios.get(`${API_BASE_URL}/api/business/all`);
    console.log(`✅ Found ${businessesResponse.data.data.length} businesses`);
      // Test 6: Create a product
    console.log('\n6. Testing product creation...');
    const testProduct = {
      name: 'Test Product',
      description: 'A test product for our test business',
      price: 29.99,
      category: 'food',
      inStock: true,
      business: businessId,
      images: ['https://via.placeholder.com/300x300.png?text=Test+Product']
    };

    const productResponse = await axios.post(`${API_BASE_URL}/api/products`, testProduct, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    console.log('✅ Product created successfully');
    console.log(`   Product ID: ${productResponse.data._id}`);

    // Test 7: Get products
    console.log('\n7. Testing product listing...');
    const productsResponse = await axios.get(`${API_BASE_URL}/api/products`);
    console.log(`✅ Found ${productsResponse.data.length} products`);    // Test 8: Create a transaction
    console.log('\n8. Testing transaction creation...');
    const testTransaction = {
      toAddress: businessWalletResponse.data.publicKey || 'business-wallet-address',
      amount: 25.00,
      encryptedPrivateKey: 'user-test-private-key-' + Date.now(),
      description: 'Test purchase transaction'
    };

    const transactionResponse = await axios.post(`${API_BASE_URL}/api/transactions`, testTransaction, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Transaction created successfully');
    console.log(`   Transaction ID: ${transactionResponse.data._id}`);

    // Test 9: Get transaction history
    console.log('\n9. Testing transaction history...');
    const transactionsResponse = await axios.get(`${API_BASE_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log(`✅ Found ${transactionsResponse.data.length} transactions`);

    // Test 10: Check blockchain
    console.log('\n10. Testing blockchain...');
    const blockchainResponse = await axios.get(`${API_BASE_URL}/api/blockchain/blocks`);
    console.log(`✅ Blockchain has ${blockchainResponse.data.length} blocks`);

    console.log('\n🎉 All tests passed! Full-stack application is working correctly.');
    console.log('\n📋 Test Summary:');
    console.log(`   - User Registration: ✅`);
    console.log(`   - Business Registration: ✅`);
    console.log(`   - Wallet Creation: ✅`);
    console.log(`   - Business Discovery: ✅`);
    console.log(`   - Product Management: ✅`);
    console.log(`   - Transaction Processing: ✅`);
    console.log(`   - Blockchain Integration: ✅`);
    
    console.log('\n🌐 Frontend URLs:');
    console.log(`   - Homepage: http://localhost:3000`);
    console.log(`   - Explore Businesses: http://localhost:3000/explore`);
    console.log(`   - Dashboard: http://localhost:3000/dashboard`);
    console.log(`   - QR Payments: http://localhost:3000/qr-payment`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔧 Make sure both backend (port 5000) and frontend (port 3000) are running');
  }
}

testFullFlow();
