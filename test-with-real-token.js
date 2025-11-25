// Quick test with real FCM token - Admin Portal Provider Registration
const axios = require("axios");

const BASE_URL = "http://localhost:4000";
const userId = "admin_user_123"; // Admin user ID

// Real provider data that will be sent randomly
const providers = [
  {
    name: "Aust",
    id: "d8e8467f-acb6-4446-8761-c1f1590763e4",
  },
  {
    name: "Testing Purpose - 002",
    id: "26e87b6c-b96d-44d5-91ac-266b070a58c7",
  },
  {
    name: "Farhan Understanding",
    id: "b7a0eee4-914f-48bd-88c1-753be81f4ec5",
  },
  {
    name: "United International University",
    id: "2f89d4af-8488-4b2c-a256-a5faf03fd149",
  },
  {
    id: "3306dac1-1f24-4c77-812f-8484de82a713",
    name: "RVL",
  },
  {
    id: "9a02eb53-1eaa-472e-ae5c-69dbd5546eca",
    name: "URBA",
  },
];

async function testNotification() {
  try {
    // Randomly select a provider
    const randomProvider =
      providers[Math.floor(Math.random() * providers.length)];

    console.log("🔔 Triggering provider registration notification...");
    console.log(`📋 Provider: ${randomProvider.name}`);
    console.log(`🆔 ID: ${randomProvider.id}\n`);

    const response = await axios.post(
      `${BASE_URL}/admin/trigger-notification`,
      {
        userId: userId,
        providerId: randomProvider.id,
        providerName: randomProvider.name,
      }
    );

    console.log("✅ Success!");
    console.log("Response:", response.data);
    console.log(`\n📱 Check your browser for the notification!`);
    console.log(`🔗 Redirect URL: /service-providers/${randomProvider.id}`);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testNotification();
