import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let token = null;
let productId = null;
let cartId = null;
let orderId = null;
let reviewId = null;

const testAllFeatures = async () => {
  try {
    console.log('🚀 Starting comprehensive test flow...\n');

    // Test server connection first
    console.log('Testing server connection...');
    try {
      const serverCheck = await axios.get(BASE_URL);
      console.log('✅ Server is running:', serverCheck.data.message);
    } catch (error) {
      throw new Error(`Server not responding: ${error.message}`);
    }

    // 1. Authentication Tests
    console.log('\n📍 Testing Authentication...');
    // Register
    try {
      console.log('Attempting registration...');
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });
      console.log('✅ Registration successful:', registerResponse.data);
    } catch (error) {
      if (error.response?.data?.message === "User already exists") {
        console.log('ℹ️ User already exists, proceeding to login...');
      } else {
        console.error('❌ Registration failed:', error.response?.data || error.message);
        throw error;
      }
    }

    // Login
    console.log('Attempting login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: "test@example.com",
        password: "password123"
      });
      token = loginResponse.data.token;
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }

    // 2. Product Tests
    console.log('\n📍 Testing Product Operations...');
    try {
      // Create Product
      console.log('Creating product...');
      const productResponse = await axios.post(
        `${BASE_URL}/products`,
        {
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category: 'Electronics',
          stock: 10
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      productId = productResponse.data.product._id;
      console.log('✅ Product created:', productId);
    } catch (error) {
      console.error('❌ Product creation failed:', error.response?.data || error.message);
      throw error;
    }

    // Continue with other tests...
    console.log('\n🎉 All tests completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
};

// Run tests
console.log('Starting test suite...');
testAllFeatures().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
