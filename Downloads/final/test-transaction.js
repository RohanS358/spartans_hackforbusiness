// test-transaction.js
const axios = require('axios');

// Set up axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test function to login as a user
const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Test function to create a transaction using the token
const createTransaction = async (token, toAddress, amount, encryptedPrivateKey) => {
  try {
    const response = await api.post('/transactions', {
      toAddress,
      amount,
      encryptedPrivateKey
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Transaction Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Test function to get user's transactions
const getMyTransactions = async (token) => {
  try {
    const response = await api.get('/transactions', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get Transactions Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Run the tests
const runTests = async () => {
  try {
    // First register a new user for testing
    console.log('Registering a new test user...');
    const registrationResponse = await api.post('/auth/register', {
      name: 'Test User',
      email: 'testuser' + Date.now() + '@example.com',
      password: 'password123',
      phone: '1234567890'
    });
    
    console.log('Registration successful:', registrationResponse.data);
    const userData = registrationResponse.data;
    
    // Test getting the user's transactions
    console.log('\nGetting user transactions...');
    try {
      const transactions = await getMyTransactions(userData.token);
      console.log('Successfully retrieved user transactions:', transactions);
    } catch (txError) {
      console.error('Failed to get transactions. If this is a "No wallet found" error, that is expected for a new user without a wallet.');
    }
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

runTests();
