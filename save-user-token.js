// Save user FCM token to backend
const axios = require("axios");

const BASE_URL = "http://localhost:4000";
const userId = "user_123"; // User portal user ID

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.error("❌ Error: Please provide FCM token as argument");
  console.log("Usage: node save-user-token.js YOUR_FCM_TOKEN");
  process.exit(1);
}

async function saveToken() {
  try {
    console.log("💾 Saving user FCM token...");
    console.log(`User ID: ${userId}`);
    console.log(`Token: ${token.substring(0, 20)}...`);

    const response = await axios.post(`${BASE_URL}/user/save-token`, {
      userId: userId,
      token: token,
    });

    console.log("✅ Token saved successfully!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

saveToken();
