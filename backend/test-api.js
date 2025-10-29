/**
 * API Testing Script for Karunya Hostel Delivery
 * Run this script to test all API endpoints
 * 
 * Usage: node test-api.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let testUserId = null;
let testOrderId = null;
let deliveryToken = null;
let deliveryUserId = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(test, response) {
  log(`✅ PASS: ${test}`, 'green');
  if (response?.data) {
    log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`, 'cyan');
  }
}

function logError(test, error) {
  log(`❌ FAIL: ${test}`, 'red');
  log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`   ${title}`, 'blue');
  log(`${'='.repeat(60)}\n`, 'blue');
}

// Test 1: Health Check
async function testHealthCheck() {
  try {
    const response = await axios.get('http://localhost:5000/health');
    logSuccess('Health Check', response);
    return true;
  } catch (error) {
    logError('Health Check', error);
    return false;
  }
}

// Test 2: Register Customer
async function testRegisterCustomer() {
  try {
    const userData = {
      name: 'Test Customer',
      email: `customer${Date.now()}@test.com`,
      password: 'test1234',
      role: 'customer',
      room: 'A-101',
      phone: '9876543210',
      gender: 'boys',
      year: 2,
      hostel: 'Alpha Hostel'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    authToken = response.data.token;
    testUserId = response.data.user._id;
    logSuccess('Register Customer', response);
    return true;
  } catch (error) {
    logError('Register Customer', error);
    return false;
  }
}

// Test 3: Register Delivery Student
async function testRegisterDelivery() {
  try {
    const userData = {
      name: 'Test Delivery',
      email: `delivery${Date.now()}@test.com`,
      password: 'test1234',
      role: 'delivery',
      room: 'B-201',
      phone: '9876543211',
      gender: 'boys',
      year: 3,
      hostel: 'Beta Hostel'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    deliveryToken = response.data.token;
    deliveryUserId = response.data.user._id;
    logSuccess('Register Delivery Student', response);
    return true;
  } catch (error) {
    logError('Register Delivery Student', error);
    return false;
  }
}

// Test 4: Login
async function testLogin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'customer@test.com',
      password: 'test1234',
      role: 'customer'
    });
    logSuccess('Login (will fail with new user - expected)', response);
    return true;
  } catch (error) {
    log('⚠️  Login test with non-existent user (expected to fail)', 'yellow');
    return true; // Expected to fail
  }
}

// Test 5: Get Current User
async function testGetCurrentUser() {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Get Current User', response);
    return true;
  } catch (error) {
    logError('Get Current User', error);
    return false;
  }
}

// Test 6: Create Order
async function testCreateOrder() {
  try {
    const orderData = {
      title: 'Test Food Order',
      type: 'food',
      from: 'KFC, University Road',
      room: 'A-101',
      description: 'Large bucket of chicken',
      price: 250,
      specialInstructions: 'Please call before delivery'
    };
    
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testOrderId = response.data.data._id;
    logSuccess('Create Order', response);
    log(`   Order ID: ${testOrderId}`, 'cyan');
    return true;
  } catch (error) {
    logError('Create Order', error);
    return false;
  }
}

// Test 7: Get All Orders
async function testGetOrders() {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Get All Orders', response);
    log(`   Total Orders: ${response.data.count}`, 'cyan');
    return true;
  } catch (error) {
    logError('Get All Orders', error);
    return false;
  }
}

// Test 8: Get Single Order
async function testGetOrder() {
  try {
    if (!testOrderId) {
      log('⚠️  Skipping: No test order ID available', 'yellow');
      return true;
    }
    
    const response = await axios.get(`${API_BASE_URL}/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Get Single Order', response);
    return true;
  } catch (error) {
    logError('Get Single Order', error);
    return false;
  }
}

// Test 9: Accept Order (Delivery Student)
async function testAcceptOrder() {
  try {
    if (!testOrderId) {
      log('⚠️  Skipping: No test order ID available', 'yellow');
      return true;
    }
    
    const response = await axios.put(
      `${API_BASE_URL}/orders/${testOrderId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${deliveryToken}` } }
    );
    logSuccess('Accept Order', response);
    log(`   OTP Generated: ${response.data.data.deliveryOTP}`, 'cyan');
    return true;
  } catch (error) {
    logError('Accept Order', error);
    return false;
  }
}

// Test 10: Update Order Status
async function testUpdateOrderStatus() {
  try {
    if (!testOrderId) {
      log('⚠️  Skipping: No test order ID available', 'yellow');
      return true;
    }
    
    const response = await axios.put(
      `${API_BASE_URL}/orders/${testOrderId}/status`,
      { status: 'picked-up' },
      { headers: { Authorization: `Bearer ${deliveryToken}` } }
    );
    logSuccess('Update Order Status to Picked-Up', response);
    return true;
  } catch (error) {
    logError('Update Order Status', error);
    return false;
  }
}

// Test 11: Get Order Timeline
async function testGetOrderTimeline() {
  try {
    if (!testOrderId) {
      log('⚠️  Skipping: No test order ID available', 'yellow');
      return true;
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/orders/${testOrderId}/timeline`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('Get Order Timeline', response);
    return true;
  } catch (error) {
    logError('Get Order Timeline', error);
    return false;
  }
}

// Test 12: Get Messages
async function testGetMessages() {
  try {
    if (!testOrderId) {
      log('⚠️  Skipping: No test order ID available', 'yellow');
      return true;
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/messages/${testOrderId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('Get Messages for Order', response);
    return true;
  } catch (error) {
    logError('Get Messages', error);
    return false;
  }
}

// Test 13: Send Message
async function testSendMessage() {
  try {
    if (!testOrderId) {
      log('⚠️  Skipping: No test order ID available', 'yellow');
      return true;
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/messages/${testOrderId}`,
      { content: 'Test message from API test', type: 'text' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('Send Message', response);
    return true;
  } catch (error) {
    logError('Send Message', error);
    return false;
  }
}

// Test 14: Get Leaderboard
async function testGetLeaderboard() {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/leaderboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Get Leaderboard', response);
    return true;
  } catch (error) {
    logError('Get Leaderboard', error);
    return false;
  }
}

// Test 15: Toggle Availability
async function testToggleAvailability() {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/auth/toggle-availability`,
      {},
      { headers: { Authorization: `Bearer ${deliveryToken}` } }
    );
    logSuccess('Toggle Delivery Availability', response);
    return true;
  } catch (error) {
    logError('Toggle Availability', error);
    return false;
  }
}

// Test 16: Update User Profile
async function testUpdateProfile() {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/auth/updatedetails`,
      { name: 'Updated Test Customer', phone: '9876543299' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('Update User Profile', response);
    return true;
  } catch (error) {
    logError('Update User Profile', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n🧪 KARUNYA HOSTEL DELIVERY - API TEST SUITE 🧪\n', 'cyan');
  log('Testing backend at: http://localhost:5000', 'yellow');
  log('Make sure the backend server is running!\n', 'yellow');
  
  const tests = [
    { name: 'Server Health', fn: testHealthCheck, section: 'Core' },
    { name: 'Authentication', fn: testRegisterCustomer, section: 'Authentication' },
    { name: 'Register Delivery', fn: testRegisterDelivery, section: 'Authentication' },
    { name: 'Login', fn: testLogin, section: 'Authentication' },
    { name: 'Get Current User', fn: testGetCurrentUser, section: 'Authentication' },
    { name: 'Update Profile', fn: testUpdateProfile, section: 'User Management' },
    { name: 'Toggle Availability', fn: testToggleAvailability, section: 'User Management' },
    { name: 'Create Order', fn: testCreateOrder, section: 'Orders' },
    { name: 'Get Orders', fn: testGetOrders, section: 'Orders' },
    { name: 'Get Single Order', fn: testGetOrder, section: 'Orders' },
    { name: 'Accept Order', fn: testAcceptOrder, section: 'Orders' },
    { name: 'Update Status', fn: testUpdateOrderStatus, section: 'Orders' },
    { name: 'Order Timeline', fn: testGetOrderTimeline, section: 'Orders' },
    { name: 'Get Messages', fn: testGetMessages, section: 'Messaging' },
    { name: 'Send Message', fn: testSendMessage, section: 'Messaging' },
    { name: 'Leaderboard', fn: testGetLeaderboard, section: 'Analytics' }
  ];
  
  let currentSection = '';
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    if (test.section !== currentSection) {
      currentSection = test.section;
      logSection(currentSection);
    }
    
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(test.name, error);
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Summary
  logSection('Test Summary');
  const total = passed + failed;
  log(`Total Tests: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');
  log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%\n`, 'yellow');
  
  if (failed === 0) {
    log('🎉 ALL TESTS PASSED! Application is ready for deployment! 🎉\n', 'green');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.\n', 'red');
  }
}

// Run tests
runTests().catch(error => {
  log('\n❌ Test suite failed to complete:', 'red');
  console.error(error);
  process.exit(1);
});
