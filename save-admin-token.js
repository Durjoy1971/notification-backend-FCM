// Helper script to save FCM token for admin user
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function saveToken() {
  try {
    const userId = 'admin_user_123';
    const token = process.argv[2]; // Get token from command line argument
    
    if (!token) {
      console.error('❌ Error: Please provide FCM token as argument');
      console.log('\nUsage: node save-admin-token.js <YOUR_FCM_TOKEN>');
      console.log('\nExample:');
      console.log('node save-admin-token.js dXYz123ABC...');
      process.exit(1);
    }
    
    console.log('💾 Saving FCM token for admin user...\n');
    
    const response = await axios.post(`${BASE_URL}/admin/save-token`, {
      userId: userId,
      token: token
    });
    
    console.log('✅ Token saved successfully!');
    console.log(`👤 User ID: ${userId}`);
    console.log(`🔑 Token: ${token.substring(0, 20)}...`);
    console.log('\n📝 You can now run: node test-with-real-token.js');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

saveToken();
