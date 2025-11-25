const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- MOCK DATABASE ---
let userTokens = {};
let notificationHistory = {}; // Stores notifications: { "user_123": [ { id, title, body, ... } ] }

// 1. SAVE TOKEN (Admin Portal)
app.post("/admin/save-token", (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(400).send("Missing data");

  userTokens[userId] = token;
  console.log(`✅ Token saved for ${userId}`);
  res.status(200).send("Saved");
});

// 2. TRIGGER NOTIFICATION - Provider Registration (Admin Portal)
app.post("/admin/trigger-notification", async (req, res) => {
  const { userId, providerId, providerName } = req.body;
  const token = userTokens[userId];

  if (!token) return res.status(404).send("User token not found");

  // Create the notification object for provider registration
  const notificationData = {
    id: Date.now(), // Unique ID
    title: "New Provider Registration",
    body: `${providerName} has successfully registered as a service provider.`,
    data: {
      url: `/service-providers/${providerId}`,
      action_id: providerId,
      type: "provider_registration",
    },
    timestamp: new Date().toISOString(),
    read: false,
  };

  // 1. Save to History (In-Memory Database)
  if (!notificationHistory[userId]) notificationHistory[userId] = [];
  notificationHistory[userId].unshift(notificationData); // Add to top of list

  // 2. Send to Firebase (Real-time Popup)
  const message = {
    notification: {
      title: notificationData.title,
      body: notificationData.body,
    },
    data: {
      // Firebase data must be strings
      url: notificationData.data.url,
      action_id: String(notificationData.data.action_id),
      type: notificationData.data.type,
    },
    token: token,
  };

  try {
    await admin.messaging().send(message);
    console.log(
      `🚀 Sent notification for provider: ${providerName} (${providerId})`
    );
    res.status(200).json({ success: true, notification: notificationData });
  } catch (error) {
    console.error("Error sending:", error);
    res.status(500).send(error.message);
  }
});

// 3. GET NOTIFICATIONS (For the Dropdown List - Admin Portal)
app.get("/admin/notifications/:userId", (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status; // 'read', 'unread', or undefined (all)

  let list = notificationHistory[userId] || [];

  // Calculate unread count from the full list (before filtering)
  const unread_count = list.filter((n) => !n.read).length;

  // Apply status filter if provided
  if (status === "read") {
    list = list.filter((n) => n.read);
  } else if (status === "unread") {
    list = list.filter((n) => !n.read);
  }

  const total_notification = list.length;
  const total_pages = Math.ceil(total_notification / limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedList = list.slice(startIndex, endIndex);

  res.status(200).json({
    total_notification,
    unread_count,
    current_page: page,
    total_pages,
    data: paginatedList,
  });
});

// 4. MARK AS READ (Admin Portal)
app.post("/admin/notifications/mark-read", (req, res) => {
  const { userId, notificationId } = req.body;
  if (notificationHistory[userId]) {
    const notif = notificationHistory[userId].find(
      (n) => n.id === notificationId
    );
    if (notif) notif.read = true;
  }
  res.status(200).send("Updated");
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});
