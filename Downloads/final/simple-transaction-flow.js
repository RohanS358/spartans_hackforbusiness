// Simple Transaction Flow Test
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function simpleTransactionFlow() {
  try {
    console.log('🚀 Starting Simple Transaction Flow Test...\n');

    // Step 1: Register User (Customer)
    console.log('1️⃣ Registering customer...');
    const customer = await api.post('/auth/register', {
      name: 'Alice Customer',
      email: `customer${Date.now()}@example.com`,
      password: 'password123'
    });
    console.log('✅ Customer registered:', customer.data.user.name);
    
    // Step 2: Register Business
    console.log('\n2️⃣ Registering business...');
    const business = await api.post('/business/register', {
      name: 'Coffee Shop',
      email: `business${Date.now()}@example.com`,
      password: 'password123',
      businessType: 'cafe'
    });
    console.log('✅ Business registered:', business.data.business.name);    // Step 3: Create Customer Wallet
    console.log('\n3️⃣ Creating customer wallet...');
    const customerPrivateKey = `customer-key-${Date.now()}`;
    const customerWallet = await api.post('/wallet', 
      { privateKey: customerPrivateKey },
      { headers: { Authorization: `Bearer ${customer.data.token}` } }
    );
    console.log('✅ Customer wallet created:', customerWallet.data.data.address);
    console.log('💰 Initial balance:', customerWallet.data.data.balance);

    // Step 4: Create Business Wallet
    console.log('\n4️⃣ Creating business wallet...');
    const businessPrivateKey = `business-key-${Date.now()}`;
    const businessWallet = await api.post('/wallet',
      { privateKey: businessPrivateKey },
      { headers: { Authorization: `Bearer ${business.data.token}` } }
    );
    console.log('✅ Business wallet created:', businessWallet.data.data.address);

    // Step 5: Create Transaction (Customer pays Business)
    console.log('\n5️⃣ Creating transaction...');
    const transaction = await api.post('/transactions',
      {
        toAddress: businessWallet.data.data.address,
        amount: 25, // $25 for coffee and snacks
        encryptedPrivateKey: customerPrivateKey, // Use the same private key used to create the wallet
        productId: null // Optional: reference to a product
      },
      { headers: { Authorization: `Bearer ${customer.data.token}` } }
    );
    console.log('✅ Transaction created successfully!');
    console.log('📋 Transaction Hash:', transaction.data.data.transaction.hash);
    console.log('💸 Amount:', transaction.data.data.transaction.amount);
    console.log('📱 QR Code generated for verification');

    // Step 6: Verify Transaction
    console.log('\n6️⃣ Verifying transaction...');
    const verification = await api.get(`/transactions/verify/${transaction.data.data.transaction.hash}`);
    console.log('✅ Transaction verification:', verification.data.verified ? 'VERIFIED' : 'PENDING');
    console.log('🔍 Confirmations:', verification.data.confirmations);

    // Step 7: Check Customer's Transactions
    console.log('\n7️⃣ Checking customer transaction history...');
    const customerTransactions = await api.get('/transactions', 
      { headers: { Authorization: `Bearer ${customer.data.token}` } }
    );
    console.log('✅ Customer has', customerTransactions.data.count, 'transactions');

    // Step 8: Check Business's Transactions
    console.log('\n8️⃣ Checking business transaction history...');
    const businessTransactions = await api.get('/transactions', 
      { headers: { Authorization: `Bearer ${business.data.token}` } }
    );
    console.log('✅ Business has', businessTransactions.data.count, 'transactions');

    console.log('\n🎉 Transaction flow completed successfully!');
    console.log('📊 Summary:');
    console.log(`   Customer: ${customer.data.user.name}`);
    console.log(`   Business: ${business.data.business.name}`);
    console.log(`   Amount: $${transaction.data.data.transaction.amount}`);
    console.log(`   Status: ${transaction.data.data.transaction.status}`);

  } catch (error) {
    console.error('❌ Error in transaction flow:', error.response ? error.response.data : error.message);
  }
}

// Run the test
simpleTransactionFlow();
