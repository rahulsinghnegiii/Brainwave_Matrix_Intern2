import axios from 'axios';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:5000/api';
let adminToken = null;

const testCaching = async () => {
  try {
    console.log('🚀 Starting cache performance test...\n');

    // 1. Login as admin
    console.log('📍 Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    adminToken = loginResponse.data.token;
    console.log('✅ Login successful');

    // 2. Create test products
    console.log('\n📍 Creating test products...');
    const products = [];
    for (let i = 0; i < 5; i++) {
      const product = await axios.post(
        `${BASE_URL}/products`,
        {
          name: `Test Product ${i}`,
          description: `Description for product ${i}`,
          price: 99.99 + i,
          category: 'Test',
          stock: 10
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      products.push(product.data);
    }
    console.log('✅ Created test products');

    // 3. Test Get Products Performance (First Request - No Cache)
    console.log('\n📍 Testing first request (no cache)...');
    const startFirstRequest = performance.now();
    const firstResponse = await axios.get(`${BASE_URL}/products`);
    const endFirstRequest = performance.now();
    const firstRequestTime = endFirstRequest - startFirstRequest;
    console.log(`⏱️ First request time: ${firstRequestTime.toFixed(2)}ms`);

    // 4. Test Get Products Performance (Second Request - Should be Cached)
    console.log('\n📍 Testing second request (should be cached)...');
    const startSecondRequest = performance.now();
    const secondResponse = await axios.get(`${BASE_URL}/products`);
    const endSecondRequest = performance.now();
    const secondRequestTime = endSecondRequest - startSecondRequest;
    console.log(`⏱️ Second request time: ${secondRequestTime.toFixed(2)}ms`);

    // 5. Compare Response Times
    const improvement = ((firstRequestTime - secondRequestTime) / firstRequestTime) * 100;
    console.log('\n📊 Cache Performance Analysis:');
    console.log(`First Request: ${firstRequestTime.toFixed(2)}ms`);
    console.log(`Second Request: ${secondRequestTime.toFixed(2)}ms`);
    console.log(`Performance Improvement: ${improvement.toFixed(2)}%`);

    // 6. Verify Data Consistency
    console.log('\n📍 Verifying data consistency...');
    const firstData = JSON.stringify(firstResponse.data);
    const secondData = JSON.stringify(secondResponse.data);
    const isConsistent = firstData === secondData;
    console.log(isConsistent ? 
      '✅ Data is consistent between requests' : 
      '❌ Data inconsistency detected');

    // 7. Test Cache Invalidation
    console.log('\n📍 Testing cache invalidation...');
    
    // Create new product to invalidate cache
    await axios.post(
      `${BASE_URL}/products`,
      {
        name: 'Cache Test Product',
        description: 'Testing cache invalidation',
        price: 199.99,
        category: 'Test',
        stock: 5
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('✅ Created new product to invalidate cache');

    // Get products again
    const startThirdRequest = performance.now();
    const thirdResponse = await axios.get(`${BASE_URL}/products`);
    const endThirdRequest = performance.now();
    const thirdRequestTime = endThirdRequest - startThirdRequest;
    console.log(`⏱️ Post-invalidation request time: ${thirdRequestTime.toFixed(2)}ms`);

    // Verify new product is in response
    const hasNewProduct = thirdResponse.data.some(p => p.name === 'Cache Test Product');
    console.log(hasNewProduct ? 
      '✅ Cache was properly invalidated' : 
      '❌ Cache invalidation failed');

    console.log('\n🎉 Cache testing completed successfully!');

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

// Run test
console.log('Starting cache test...');
testCaching().catch(console.error); 