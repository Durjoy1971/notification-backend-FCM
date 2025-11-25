// test-notification.js
// Quick script to test sending notifications

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test data
const userId = 'test-user-123';
const testToken = 'YOUR_FCM_TOKEN_HERE'; // Replace with actual FCM token from frontend

async function saveToken() {
  try {
    console.log('📝 Saving token...');
    const response = await axios.post(`${BASE_URL}/save-token`, {
      userId: userId,
      token: testToken
    });
    console.log('✅ Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function triggerNotification() {
  try {
    console.log('\n🔔 Triggering notification...');
    const response = await axios.post(`${BASE_URL}/trigger-notification`, {
      userId: userId,
      status: 'approved',
      docId: 'DOC-12345'
    });
    console.log('✅ Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting notification tests...\n');
  
  // First save the token
  await saveToken();
  
  // Wait a bit, then trigger notification
  setTimeout(async () => {
    await triggerNotification();
    console.log('\n✨ Tests complete!');
  }, 1000);
}

// Run the tests
runTests();
