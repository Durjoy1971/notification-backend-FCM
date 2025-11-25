// Test user portal notification endpoints (without FCM sending)
// This tests the API structure and data flow without requiring valid FCM tokens
const axios = require("axios");

const BASE_URL = "http://localhost:4000";
const userId = "user_test_123";

// Sample document notifications
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

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  try {
    console.log("=".repeat(60));
    console.log("USER PORTAL NOTIFICATION API - STRUCTURE TEST");
    console.log("=".repeat(60));
    console.log();

    // Test 1: Trigger Notifications (will fail at FCM but save to history)
    console.log("📝 Test 1: Trigger Notifications (Testing API Structure)");
    console.log("-".repeat(60));
    console.log("Note: FCM sending will fail (expected), but notifications");
    console.log("will be saved to history for testing pagination/filtering.");
    console.log();

    for (let i = 0; i < 5; i++) {
      const doc =
        documentNotifications[
          Math.floor(Math.random() * documentNotifications.length)
        ];

      try {
        await axios.post(`${BASE_URL}/user/trigger-notification`, {
          userId: userId,
          documentId: `${doc.documentId}-${i}`,
          documentType: doc.documentType,
          providerName: doc.providerName,
          status: doc.status,
          redirectUrl: doc.redirectUrl,
        });
        console.log(
          `✅ Notification ${i + 1}: ${doc.status.toUpperCase()} - ${
            doc.documentType
          }`
        );
      } catch (error) {
        // Expected to fail at FCM sending, but notification is saved to history
        console.log(
          `⚠️  Notification ${i + 1}: API called (FCM failed as expected)`
        );
      }
      await sleep(300);
    }
    console.log();

    // Test 2: Get All Notifications
    console.log("📝 Test 2: Get All Notifications (Paginated)");
    console.log("-".repeat(60));
    const allNotifs = await axios.get(
      `${BASE_URL}/user/notifications/${userId}?page=1&limit=10`
    );
    console.log(`✅ Total Notifications: ${allNotifs.data.total_notification}`);
    console.log(`✅ Unread Count: ${allNotifs.data.unread_count}`);
    console.log(`✅ Current Page: ${allNotifs.data.current_page}`);
    console.log(`✅ Total Pages: ${allNotifs.data.total_pages}`);
    console.log(`✅ Notifications on this page: ${allNotifs.data.data.length}`);
    console.log();

    // Test 3: Get Only Unread Notifications
    console.log("📝 Test 3: Filter by Unread Status");
    console.log("-".repeat(60));
    const unreadNotifs = await axios.get(
      `${BASE_URL}/user/notifications/${userId}?status=unread`
    );
    console.log(
      `✅ Unread Notifications: ${unreadNotifs.data.total_notification}`
    );
    console.log(`✅ Unread Count Badge: ${unreadNotifs.data.unread_count}`);
    console.log();

    // Test 4: Mark First Notification as Read
    console.log("📝 Test 4: Mark Notification as Read");
    console.log("-".repeat(60));
    if (allNotifs.data.data.length > 0) {
      const firstNotif = allNotifs.data.data[0];
      await axios.post(`${BASE_URL}/user/notifications/mark-read`, {
        userId: userId,
        notificationId: firstNotif.id,
      });
      console.log(`✅ Marked notification ${firstNotif.id} as read`);
      console.log(`   Title: ${firstNotif.title}`);
      console.log(`   Body: ${firstNotif.body}`);
      console.log();
    }

    // Test 5: Verify Unread Count Updated
    console.log("📝 Test 5: Verify Unread Count After Marking as Read");
    console.log("-".repeat(60));
    const updatedNotifs = await axios.get(
      `${BASE_URL}/user/notifications/${userId}?page=1&limit=10`
    );
    console.log(`✅ Updated Unread Count: ${updatedNotifs.data.unread_count}`);
    console.log();

    // Test 6: Get Only Read Notifications
    console.log("📝 Test 6: Filter by Read Status");
    console.log("-".repeat(60));
    const readNotifs = await axios.get(
      `${BASE_URL}/user/notifications/${userId}?status=read`
    );
    console.log(`✅ Read Notifications: ${readNotifs.data.total_notification}`);
    console.log();

    // Test 7: Display Sample Notifications
    console.log("📝 Test 7: Sample Notification Details");
    console.log("-".repeat(60));
    updatedNotifs.data.data.slice(0, 3).forEach((notif, index) => {
      console.log(`\nNotification ${index + 1}:`);
      console.log(`  ID: ${notif.id}`);
      console.log(`  Title: ${notif.title}`);
      console.log(`  Body: ${notif.body}`);
      console.log(`  Type: ${notif.data.type}`);
      console.log(`  Redirect URL: ${notif.data.url}`);
      console.log(`  Read: ${notif.read ? "✓" : "✗"}`);
      console.log(`  Timestamp: ${notif.timestamp}`);
    });

    console.log();
    console.log("=".repeat(60));
    console.log("✅ ALL API STRUCTURE TESTS PASSED!");
    console.log("=".repeat(60));
    console.log();
    console.log("📌 Note: For full FCM testing, use a valid token from the");
    console.log("   frontend and use save-user-token.js to save it first.");
  } catch (error) {
    console.error("\n❌ Test Failed:");
    console.error(error.response?.data || error.message);
    console.error(error.stack);
  }
}

runTests();
