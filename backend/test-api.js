const axios = require('axios');

// Configuration
const EXPRESS_URL = 'http://localhost:3000';
const FLASK_URL = 'http://localhost:5000';

// Test data
const testUser = {
  firstname: 'John',
  lastname: 'Doe',
  email: 'john.doe@test.com',
  password: 'testpassword123'
};

const testSearchQuery = {
  query: 'best wireless headphones under $100',
  userId: 'test-user-id'
};

const testRecommendationQuery = {
  userId: 'test-user-id',
  query: 'gaming accessories',
  limit: 5
};

// Helper function to make requests
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

// Test functions
async function testExpressHealth() {
  console.log('\n🔍 Testing Express Server Health...');
  const result = await makeRequest('GET', `${EXPRESS_URL}/health`);
  
  if (result.success) {
    console.log('✅ Express Server is healthy');
    console.log('   Response:', result.data);
  } else {
    console.log('❌ Express Server health check failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
}

async function testFlaskHealth() {
  console.log('\n🔍 Testing Flask Server Health...');
  const result = await makeRequest('GET', `${FLASK_URL}/health`);
  
  if (result.success) {
    console.log('✅ Flask Server is healthy');
    console.log('   Response:', result.data);
  } else {
    console.log('❌ Flask Server health check failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
}

async function testUserSignup() {
  console.log('\n🔍 Testing User Signup...');
  const result = await makeRequest('POST', `${EXPRESS_URL}/api/auth/signup`, testUser);
  
  if (result.success) {
    console.log('✅ User signup successful');
    console.log('   User ID:', result.data.user?.id);
    return result.data.user?.id;
  } else {
    console.log('❌ User signup failed');
    console.log('   Error:', result.error);
    return null;
  }
}

async function testUserSignin() {
  console.log('\n🔍 Testing User Signin...');
  const signinData = {
    email: testUser.email,
    password: testUser.password
  };
  
  const result = await makeRequest('POST', `${EXPRESS_URL}/api/auth/signin`, signinData);
  
  if (result.success) {
    console.log('✅ User signin successful');
    console.log('   User ID:', result.data.user?.id);
    return result.data.user?.id;
  } else {
    console.log('❌ User signin failed');
    console.log('   Error:', result.error);
    return null;
  }
}

async function testSearchEndpoint() {
  console.log('\n🔍 Testing Search Endpoint...');
  const result = await makeRequest('POST', `${EXPRESS_URL}/api/search`, testSearchQuery);
  
  if (result.success) {
    console.log('✅ Search endpoint working');
    console.log('   Original Query:', result.data.originalQuery);
    console.log('   Processed Query Categories:', result.data.processedQuery?.categories);
    console.log('   Total Results:', result.data.totalResults);
  } else {
    console.log('❌ Search endpoint failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
}

async function testRecommendationEndpoint() {
  console.log('\n🔍 Testing Recommendation Endpoint...');
  const result = await makeRequest('POST', `${EXPRESS_URL}/api/recommendations`, testRecommendationQuery);
  
  if (result.success) {
    console.log('✅ Recommendation endpoint working');
    console.log('   Total Recommendations:', result.data.totalRecommendations);
    if (result.data.recommendations?.length > 0) {
      console.log('   Sample Recommendation:', result.data.recommendations[0]);
    }
  } else {
    console.log('❌ Recommendation endpoint failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
}

async function testTrendingEndpoint() {
  console.log('\n🔍 Testing Trending Recommendations...');
  const result = await makeRequest('GET', `${EXPRESS_URL}/api/recommendations/trending?limit=3`);
  
  if (result.success) {
    console.log('✅ Trending endpoint working');
    console.log('   Total Trending:', result.data.totalTrending);
  } else {
    console.log('❌ Trending endpoint failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
}

async function testFlaskRecommendations() {
  console.log('\n🔍 Testing Direct Flask Recommendations...');
  const result = await makeRequest('POST', `${FLASK_URL}/api/recommendations`, testRecommendationQuery);
  
  if (result.success) {
    console.log('✅ Direct Flask recommendations working');
    console.log('   Total Recommendations:', result.data.total_recommendations);
  } else {
    console.log('❌ Direct Flask recommendations failed');
    console.log('   Error:', result.error);
  }
  
  return result.success;
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting API Tests for AI-Powered Smart Search & Recommendation System');
  console.log('=' .repeat(80));
  
  const results = {
    expressHealth: false,
    flaskHealth: false,
    signup: false,
    signin: false,
    search: false,
    recommendations: false,
    trending: false,
    flaskDirect: false
  };
  
  // Test server health
  results.expressHealth = await testExpressHealth();
  results.flaskHealth = await testFlaskHealth();
  
  // Test authentication
  results.signup = await testUserSignup();
  results.signin = await testUserSignin();
  
  // Test search functionality
  results.search = await testSearchEndpoint();
  
  // Test recommendation functionality
  results.recommendations = await testRecommendationEndpoint();
  results.trending = await testTrendingEndpoint();
  results.flaskDirect = await testFlaskRecommendations();
  
  // Summary
  console.log('\n' + '=' .repeat(80));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(80));
  
  const testNames = {
    expressHealth: 'Express Server Health',
    flaskHealth: 'Flask Server Health',
    signup: 'User Signup',
    signin: 'User Signin',
    search: 'Search Endpoint',
    recommendations: 'Recommendation Endpoint',
    trending: 'Trending Endpoint',
    flaskDirect: 'Direct Flask Recommendations'
  };
  
  let passedTests = 0;
  let totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([key, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${testNames[key]}`);
    if (passed) passedTests++;
  });
  
  console.log('=' .repeat(80));
  console.log(`📈 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the server logs and configuration.');
  }
  
  console.log('=' .repeat(80));
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testExpressHealth,
  testFlaskHealth,
  testUserSignup,
  testUserSignin,
  testSearchEndpoint,
  testRecommendationEndpoint,
  testTrendingEndpoint,
  testFlaskRecommendations
};
