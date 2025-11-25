// Test user portal notification with document status updates
const axios = require("axios");

const BASE_URL = "http://localhost:4000";
const userId = "user_123"; // User portal user ID

// Sample document notifications based on provided mock data
const documentNotifications = [
  {
    documentId: "653163da-38ec-4124-9f70-a0e56897d938",
    documentType: "Tax Certificate",
    providerName: "Brac Bank Ltd",
    status: "approved",
    redirectUrl:
      "/document-vaults/bcf680f3-11d5-4532-847c-10b035e6d915/documents/653163da-38ec-4124-9f70-a0e56897d938",
  },
  {
    documentId: "abc123-marriage-cert",
    documentType: "Marriage Certificate",
    providerName: "Marriage Attorney",
    status: "rejected",
    redirectUrl: "/derived-documents?page=1",
  },
];

async function testUserNotification() {
  try {
    // Randomly select a document notification scenario
    const randomDoc =
      documentNotifications[
        Math.floor(Math.random() * documentNotifications.length)
      ];

    console.log("🔔 Triggering user document status notification...");
    console.log(`📋 Document Type: ${randomDoc.documentType}`);
    console.log(`🏢 Provider: ${randomDoc.providerName}`);
    console.log(`📊 Status: ${randomDoc.status.toUpperCase()}`);
    console.log(`🆔 Document ID: ${randomDoc.documentId}\n`);

    const response = await axios.post(`${BASE_URL}/user/trigger-notification`, {
      userId: userId,
      documentId: randomDoc.documentId,
      documentType: randomDoc.documentType,
      providerName: randomDoc.providerName,
      status: randomDoc.status,
      redirectUrl: randomDoc.redirectUrl,
    });

    console.log("✅ Success!");
    console.log("Response:", response.data);
    console.log(`\n📱 Check your browser for the notification!`);
    console.log(`🔗 Redirect URL: ${randomDoc.redirectUrl}`);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testUserNotification();
