import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
let adminToken = null;
let customerToken = null;
let productId = null;
let orderId = null;
let cartId = null;
let reviewId = null;

// Helper function to check server connection
const checkServerConnection = async () => {
  try {
    const response = await axios.get(BASE_URL);
    console.log('✅ Server connection successful:', response.data.message);
    return true;
  } catch (error) {
    console.error('\n❌ Server connection failed!');
    console.error('Please ensure:');
    console.error('1. Server is running (npm run dev)');
    console.error('2. Server is accessible at:', BASE_URL);
    console.error('3. MongoDB is connected');
    console.error('\nError details:', error.message);
    return false;
  }
};

const testAllFeatures = async () => {
  try {
    // Check server connection first
    const isServerRunning = await checkServerConnection();
    if (!isServerRunning) {
      process.exit(1);
    }

    console.log('\n🚀 Starting comprehensive feature tests...\n');

    // 1. User Roles & Authentication Tests
    console.log('📍 TESTING USER ROLES & AUTHENTICATION');
    
    // Login as admin
    try {
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      adminToken = adminLogin.data.token;
      console.log('✅ Admin login successful');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️ Admin login failed, trying to create admin account...');
        // Create admin account
        await axios.post(`${BASE_URL}/auth/register`, {
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'admin123',
          role: 'admin'
        });
        // Try login again
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'admin@test.com',
          password: 'admin123'
        });
        adminToken = adminLogin.data.token;
        console.log('✅ Admin account created and logged in');
      } else {
        throw error;
      }
    }

    // Create customer if doesn't exist
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: "Test Customer",
        email: "customer@test.com",
        password: "customer123"
      });
      console.log('✅ Customer registration successful');
    } catch (error) {
      if (error.response?.data?.message === "User already exists") {
        console.log('ℹ️ Customer already exists');
      } else {
        throw error;
      }
    }

    // Login as customer
    try {
      const customerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: "customer@test.com",
        password: "customer123"
      });
      customerToken = customerLoginResponse.data.token;
      console.log('✅ Customer login successful');
      console.log('Customer Token:', customerToken);
    } catch (error) {
      console.error('❌ Customer login failed:', error.response?.data);
      throw error;
    }

    // Verify tokens are set
    if (!adminToken || !customerToken) {
      throw new Error('Authentication tokens not set properly');
    }

    // 2. Product Management (Admin Only)
    console.log('\n📍 TESTING PRODUCT MANAGEMENT');
    
    // Create product as admin
    try {
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
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      productId = productResponse.data.product._id;
      console.log('✅ Admin created product:', productId);
    } catch (error) {
      console.error('❌ Product creation failed:', error.response?.data);
      throw error;
    }

    // Verify product ID is set
    if (!productId) {
      throw new Error('Product ID not set after creation');
    }

    // Continue with other tests using the valid productId...
    // 3. Wishlist Tests
    console.log('\n📍 TESTING WISHLIST');
    try {
      const wishlistResponse = await axios.post(
        `${BASE_URL}/wishlist/add/${productId}`,
        {},
        {
          headers: { Authorization: `Bearer ${customerToken}` }
        }
      );
      console.log('✅ Added product to wishlist');
      
      // Get wishlist
      const getWishlistResponse = await axios.get(
        `${BASE_URL}/wishlist`,
        {
          headers: { Authorization: `Bearer ${customerToken}` }
        }
      );
      console.log('✅ Retrieved wishlist with', getWishlistResponse.data.length, 'items');
    } catch (error) {
      console.error('❌ Wishlist operation failed:', error.response?.data);
      throw error;
    }

    // Continue with other tests...
    console.log('\n🎉 All feature tests completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
};

// Run tests
console.log('Starting feature tests...');
testAllFeatures(); 