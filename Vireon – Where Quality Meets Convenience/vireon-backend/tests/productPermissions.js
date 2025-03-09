import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let adminToken = null;
let customerToken = null;

const testProductPermissions = async () => {
  try {
    console.log('🚀 Starting product permissions test...\n');

    // 1. Create Admin User
    console.log('📍 Creating Admin User...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: "Admin User",
        email: "admin@test.com",
        password: "admin123",
        role: "admin"  // Explicitly set admin role
      });
      console.log('✅ Admin registration successful');
    } catch (error) {
      if (error.response?.data?.message === "User already exists") {
        console.log('ℹ️ Admin user already exists');
      } else {
        throw error;
      }
    }

    // 2. Create Customer User
    console.log('\n📍 Creating Customer User...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: "Customer User",
        email: "customer@test.com",
        password: "customer123"
      });
      console.log('✅ Customer registration successful');
    } catch (error) {
      if (error.response?.data?.message === "User already exists") {
        console.log('ℹ️ Customer user already exists');
      } else {
        throw error;
      }
    }

    // 3. Login as Admin
    console.log('\n📍 Testing Admin Login...');
    try {
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: "admin@test.com",
        password: "admin123"
      });
      adminToken = adminLogin.data.token;
      console.log('✅ Admin login successful');
    } catch (error) {
      console.error('❌ Admin login failed:', error.response?.data);
      throw error;
    }

    // 4. Login as Customer
    console.log('\n📍 Testing Customer Login...');
    try {
      const customerLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: "customer@test.com",
        password: "customer123"
      });
      customerToken = customerLogin.data.token;
      console.log('✅ Customer login successful');
    } catch (error) {
      console.error('❌ Customer login failed:', error.response?.data);
      throw error;
    }

    // 5. Test Admin Product Creation
    console.log('\n📍 Testing Admin Product Creation...');
    try {
      console.log('Sending product data...');
      const productData = {
        name: 'Admin Test Product',
        description: 'Created by Admin',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };
      console.log('Product data:', productData);
      
      const adminProduct = await axios.post(
        `${BASE_URL}/products`,
        productData,
        {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Admin successfully created product:', adminProduct.data);
    } catch (error) {
      console.error('❌ Admin product creation failed:');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data);
      console.error('Full error:', error);
      throw error;
    }

    // 6. Test Customer Product Creation (Should Fail)
    console.log('\n📍 Testing Customer Product Creation (Expected to Fail)...');
    try {
      await axios.post(
        `${BASE_URL}/products`,
        {
          name: 'Customer Test Product',
          description: 'Created by Customer',
          price: 49.99,
          category: 'Electronics',
          stock: 5
        },
        {
          headers: { Authorization: `Bearer ${customerToken}` }
        }
      );
      console.error('❌ Test failed: Customer should not be able to create products');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Customer correctly denied access to product creation');
      } else {
        console.error('❌ Unexpected error:', error.response?.data);
        throw error;
      }
    }

    console.log('\n🎉 All permission tests completed successfully!\n');

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
console.log('Starting permission tests...');
testProductPermissions().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 