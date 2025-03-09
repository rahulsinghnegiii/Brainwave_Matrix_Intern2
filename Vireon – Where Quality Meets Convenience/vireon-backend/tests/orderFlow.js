import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let token = null;
let productId = null;

const testOrderFlow = async () => {
  try {
    console.log('Starting test flow...');

    // 1. Register user
    console.log('Attempting registration...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });
      console.log('✅ Registration successful');
    } catch (error) {
      if (error.response?.data?.message === "User already exists") {
        console.log('User already exists, proceeding to login...');
      } else {
        throw error;
      }
    }

    // 2. Login
    console.log('Attempting login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: "test@example.com",
      password: "password123"
    });
    token = loginResponse.data.token;
    console.log('✅ Login successful');

    // 3. Create product
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
    console.log('✅ Product created');

    // 4. Add to cart
    console.log('Adding to cart...');
    await axios.post(
      `${BASE_URL}/cart/add`,
      {
        productId,
        quantity: 1
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Added to cart');

    // 5. Create order
    console.log('Creating order...');
    const orderResponse = await axios.post(
      `${BASE_URL}/orders`,
      {
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Order created:', orderResponse.data.order._id);

    // 6. Get orders
    console.log('Retrieving orders...');
    const ordersResponse = await axios.get(
      `${BASE_URL}/orders`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Orders retrieved:', ordersResponse.data.length);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Error details:', error);
  }
};

// Make sure your server is running before running the test
console.log('Checking if server is running...');
try {
  await axios.get(BASE_URL);
  console.log('Server is running. Starting tests...');
  await testOrderFlow();
} catch (error) {
  console.error('❌ Server not running or not accessible:', error.message);
  console.log('Please make sure your server is running on http://localhost:5000');
} 