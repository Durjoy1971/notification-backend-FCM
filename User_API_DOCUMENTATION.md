# User Portal Notification API Documentation

Base URL: `http://localhost:4000`

## Overview

This notification backend is designed for the **User Portal** to receive Firebase Cloud Messaging (FCM) notifications when documents are approved or rejected by service providers.

---

## Endpoints

### 1. Save FCM Token

**POST** `/user/save-token`

Save the FCM token for a user to receive notifications.

#### Request Body

```json
{
  "userId": "user_123",
  "token": "fcm_device_token_here"
}
```

#### Response

- **200 OK**: `"Saved"`
- **400 Bad Request**: `"Missing data"`

#### Example

```bash
curl -X POST http://localhost:4000/user/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "token": "your_fcm_token"
  }'
```

---

### 2. Trigger Document Status Notification

**POST** `/user/trigger-notification`

Send a notification when a document is approved or rejected.

#### Request Body

```json
{
  "userId": "user_123",
  "documentId": "653163da-38ec-4124-9f70-a0e56897d938",
  "documentType": "Tax Certificate",
  "providerName": "Brac Bank Ltd",
  "status": "approved",
  "redirectUrl": "/document-vaults/bcf680f3-11d5-4532-847c-10b035e6d915/documents/653163da-38ec-4124-9f70-a0e56897d938"
}
```

#### Request Parameters

- `userId` (string, required): User ID to send notification to
- `documentId` (string, required): Unique document identifier
- `documentType` (string, required): Type of document (e.g., "Tax Certificate", "Marriage Certificate")
- `providerName` (string, required): Name of the service provider
- `status` (string, required): Either `"approved"` or `"rejected"`
- `redirectUrl` (string, required): URL to redirect when notification is clicked

#### Response (Approved)

```json
{
  "success": true,
  "notification": {
    "id": 1732532134567,
    "title": "Document Approved",
    "body": "The Tax Certificate Request from Brac Bank Ltd has been approved.",
    "data": {
      "url": "/document-vaults/bcf680f3-11d5-4532-847c-10b035e6d915/documents/653163da-38ec-4124-9f70-a0e56897d938",
      "action_id": "653163da-38ec-4124-9f70-a0e56897d938",
      "type": "document_approved"
    },
    "timestamp": "2025-11-25T09:15:34.567Z",
    "read": false
  }
}
```

#### Response (Rejected)

```json
{
  "success": true,
  "notification": {
    "id": 1732532234567,
    "title": "Document Rejected",
    "body": "The Marriage Certificate Request from Marriage Attorney has been rejected.",
    "data": {
      "url": "/derived-documents?page=1",
      "action_id": "abc123-marriage-cert",
      "type": "document_rejected"
    },
    "timestamp": "2025-11-25T09:17:14.567Z",
    "read": false
  }
}
```

#### Error Responses

- **404 Not Found**: `"User token not found"`
- **500 Internal Server Error**: Error message from Firebase

#### Example Scenarios

**Scenario 1: Tax Certificate Approved**

```bash
curl -X POST http://localhost:4000/user/trigger-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "documentId": "653163da-38ec-4124-9f70-a0e56897d938",
    "documentType": "Tax Certificate",
    "providerName": "Brac Bank Ltd",
    "status": "approved",
    "redirectUrl": "/document-vaults/bcf680f3-11d5-4532-847c-10b035e6d915/documents/653163da-38ec-4124-9f70-a0e56897d938"
  }'
```

**Scenario 2: Marriage Certificate Rejected**

```bash
curl -X POST http://localhost:4000/user/trigger-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "documentId": "abc123-marriage-cert",
    "documentType": "Marriage Certificate",
    "providerName": "Marriage Attorney",
    "status": "rejected",
    "redirectUrl": "/derived-documents?page=1"
  }'
```

---

### 3. Get Notifications (with Pagination & Filtering)

**GET** `/user/notifications/:userId`

Retrieve paginated notifications for a specific user with optional filtering by read/unread status.

#### URL Parameters

- `userId`: The user ID

#### Query Parameters

- `page` (optional, default: `1`): Page number for pagination
- `limit` (optional, default: `10`): Number of notifications per page
- `status` (optional): Filter by notification status
  - `"read"` - Only read notifications
  - `"unread"` - Only unread notifications
  - Omit for all notifications

#### Response

```json
{
  "total_notification": 25,
  "unread_count": 8,
  "current_page": 1,
  "total_pages": 3,
  "data": [
    {
      "id": 1732532134567,
      "title": "Document Approved",
      "body": "The Tax Certificate Request from Brac Bank Ltd has been approved.",
      "data": {
        "url": "/document-vaults/bcf680f3-11d5-4532-847c-10b035e6d915/documents/653163da-38ec-4124-9f70-a0e56897d938",
        "action_id": "653163da-38ec-4124-9f70-a0e56897d938",
        "type": "document_approved"
      },
      "timestamp": "2025-11-25T09:15:34.567Z",
      "read": false
    },
    {
      "id": 1732532034567,
      "title": "Document Rejected",
      "body": "The Marriage Certificate Request from Marriage Attorney has been rejected.",
      "data": {
        "url": "/derived-documents?page=1",
        "action_id": "abc123-marriage-cert",
        "type": "document_rejected"
      },
      "timestamp": "2025-11-25T09:13:54.567Z",
      "read": true
    }
  ]
}
```

#### Response Fields

- `total_notification` (number): Total count of notifications after applying status filter
- `unread_count` (number): Total count of unread notifications (always calculated from full list, regardless of filter)
- `current_page` (number): Current page number
- `total_pages` (number): Total number of pages based on filtered results
- `data` (array): Array of notification objects for the current page

#### Examples

```bash
# Get all notifications (paginated)
curl "http://localhost:4000/user/notifications/user_123?page=1&limit=10"

# Get only unread notifications
curl "http://localhost:4000/user/notifications/user_123?page=1&limit=10&status=unread"

# Get only read notifications
curl "http://localhost:4000/user/notifications/user_123?page=1&limit=10&status=read"
```

---

### 4. Mark Notification as Read

**POST** `/user/notifications/mark-read`

Mark a specific notification as read.

#### Request Body

```json
{
  "userId": "user_123",
  "notificationId": 1732532134567
}
```

#### Response

- **200 OK**: `"Updated"`

#### Example

```bash
curl -X POST http://localhost:4000/user/notifications/mark-read \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "notificationId": 1732532134567
  }'
```

---

## Frontend Integration Guide

### 1. Initialize Firebase in User Portal

```javascript
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
```

### 2. Request Permission & Save Token

```javascript
async function setupNotifications() {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY",
      });

      // Save token to backend
      await fetch("http://localhost:4000/user/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user_123",
          token: token,
        }),
      });
    }
  } catch (error) {
    console.error("Error setting up notifications:", error);
  }
}
```

### 3. Listen for Foreground Notifications

```javascript
onMessage(messaging, (payload) => {
  console.log("Notification received:", payload);

  // Show notification icon with unread state
  updateNotificationBadge();

  // Optionally show a toast/alert
  showNotificationToast(payload.notification);
});
```

### 4. Display Notification List with Unread Badge

```javascript
async function fetchNotifications(page = 1, limit = 10, status = null) {
  let url = `http://localhost:4000/user/notifications/user_123?page=${page}&limit=${limit}`;

  if (status) {
    url += `&status=${status}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  // Update unread badge (always shows total unread count)
  updateUnreadBadge(data.unread_count);

  // Display notifications in dropdown
  renderNotificationList(data.data);

  // Display pagination info
  renderPagination(data.current_page, data.total_pages);

  console.log(
    `Showing ${data.data.length} of ${data.total_notification} notifications`
  );
  console.log(`Total unread: ${data.unread_count}`);
}

// Update the notification bell badge
function updateUnreadBadge(count) {
  const badge = document.getElementById("notification-badge");
  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

// Example: Fetch only unread notifications
async function fetchUnreadNotifications() {
  await fetchNotifications(1, 10, "unread");
}
```

### 5. Handle Notification Click

```javascript
function handleNotificationClick(notification) {
  // Mark as read
  fetch("http://localhost:4000/user/notifications/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "user_123",
      notificationId: notification.id,
    }),
  });

  // Redirect based on notification type
  window.location.href = notification.data.url;
  // Examples:
  // - Approved: /document-vaults/bcf680f3-11d5-4532-847c-10b035e6d915/documents/653163da-38ec-4124-9f70-a0e56897d938
  // - Rejected: /derived-documents?page=1
}
```

---

## Testing

### 1. Save User Token

```bash
node save-user-token.js YOUR_FCM_TOKEN
```

### 2. Trigger Test Notification

```bash
node test-user-notification.js
```

This will randomly select between the two document scenarios (approved Tax Certificate or rejected Marriage Certificate) and send a notification.

---

## Notification Flow

1. **Document Processing**: Service provider approves/rejects a document
2. **Backend Trigger**: Service portal backend calls `/user/trigger-notification`
3. **FCM Sends**: Firebase sends push notification to user's device
4. **User Receives**: Notification appears in browser/app
5. **Click Handler**: On click, user is redirected to appropriate page
6. **Mark as Read**: Notification is marked as read in the system

---

## Notification Types

- `document_approved`: Document has been approved by service provider
- `document_rejected`: Document has been rejected by service provider

---

## Notes

- All URLs have `/user` prefix for user portal
- Notification titles: "Document Approved" or "Document Rejected"
- Message format: "The {documentType} Request from {providerName} has been {approved/rejected}."
- Redirect URLs are provided by the service portal
- Notifications are stored in-memory (will be lost on server restart)
- For production, use a database (MongoDB, PostgreSQL, etc.)
