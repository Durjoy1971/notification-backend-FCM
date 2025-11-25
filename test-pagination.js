const axios = require("axios");

const BASE_URL = "http://localhost:4000";
const userId = "test_user_pagination";

async function runTest() {
  try {
    // 0. Save Token
    console.log("Saving token...");
    await axios.post(`${BASE_URL}/admin/save-token`, {
      userId,
      token: "user_123",
    });
    console.log("Token saved.");

    // 1. Populate with 25 notifications
    console.log("Populating notifications...");
    for (let i = 1; i <= 25; i++) {
      try {
        await axios.post(`${BASE_URL}/admin/trigger-notification`, {
          userId,
          providerId: `provider_${i}`,
          providerName: `Provider ${i}`,
        });
      } catch (e) {
        // Ignore errors (fake token causes 500 from Firebase, but history is saved)
      }
    }
    console.log("Populated 25 notifications.");

    // 2. Test Page 1 (Default limit 10)
    console.log("\nTesting Page 1...");
    const res1 = await axios.get(
      `${BASE_URL}/admin/notifications/${userId}?page=1`
    );
    console.log(`Page 1 count: ${res1.data.length}`);
    if (res1.data.length === 10) console.log("✅ Page 1 passed");
    else console.error("❌ Page 1 failed");

    // 3. Test Page 2
    console.log("\nTesting Page 2...");
    const res2 = await axios.get(
      `${BASE_URL}/admin/notifications/${userId}?page=2`
    );
    console.log(`Page 2 count: ${res2.data.length}`);
    if (res2.data.length === 10) console.log("✅ Page 2 passed");
    else console.error("❌ Page 2 failed");

    // 4. Test Page 3 (Should have 5)
    console.log("\nTesting Page 3...");
    const res3 = await axios.get(
      `${BASE_URL}/admin/notifications/${userId}?page=3`
    );
    console.log(`Page 3 count: ${res3.data.length}`);
    if (res3.data.length === 5) console.log("✅ Page 3 passed");
    else console.error("❌ Page 3 failed");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

runTest();
