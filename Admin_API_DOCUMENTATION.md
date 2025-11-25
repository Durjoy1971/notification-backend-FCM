# Admin Portal Notification API Documentation

Base URL: `http://localhost:4000`

## Overview

This notification backend is designed for the **Admin Portal** to receive Firebase Cloud Messaging (FCM) notifications when service providers register successfully.

---

## Endpoints

### 1. Save FCM Token

**POST** `/admin/save-token`

Save the FCM token for an admin user to receive notifications.

#### Request Body

```json
{
  "userId": "admin_user_123",
  "token": "fcm_device_token_here"
}
```

#### Response

- **200 OK**: `"Saved"`
- **400 Bad Request**: `"Missing data"`

#### Example

```bash
curl -X POST http://localhost:4000/admin/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin_user_123",
    "token": "your_fcm_token"
  }'
```

---

### 2. Trigger Provider Registration Notification

**POST** `/admin/trigger-notification`

Send a notification when a service provider successfully registers.

#### Request Body

```json
{
  "userId": "admin_user_123",
  "providerId": "d8e8467f-acb6-4446-8761-c1f1590763e4",
  "providerName": "Aust"
}
```

#### Response

```json
{
  "success": true,
  "notification": {
    "id": 1732105234567,
    "title": "New Provider Registration",
    "body": "Aust has successfully registered as a service provider.",
    "data": {
      "url": "/service-providers/d8e8467f-acb6-4446-8761-c1f1590763e4",
      "action_id": "d8e8467f-acb6-4446-8761-c1f1590763e4",
      "type": "provider_registration"
    },
    "timestamp": "2025-11-20T13:40:34.567Z",
    "read": false
  }
}
```

#### Error Responses

- **404 Not Found**: `"User token not found"`
- **500 Internal Server Error**: Error message from Firebase

#### Example Provider Data

Use one of these real provider IDs when testing:

| Provider Name         | Provider ID                            |
| --------------------- | -------------------------------------- |
| Aust                  | `d8e8467f-acb6-4446-8761-c1f1590763e4` |
| Testing Purpose - 002 | `26e87b6c-b96d-44d5-91ac-266b070a58c7` |
| Farhan Understanding  | `b7a0eee4-914f-48bd-88c1-753be81f4ec5` |

---

### 3. Get Notifications (with Pagination & Filtering)

**GET** `/admin/notifications/:userId`

Retrieve paginated notifications for a specific admin user with optional filtering by read/unread status.

#### URL Parameters

- `userId`: The admin user ID

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
  "total_notification": 50,
  "unread_count": 12,
  "current_page": 1,
  "total_pages": 5,
  "data": [
    {
      "id": 1732105234567,
      "title": "New Provider Registration",
      "body": "Aust has successfully registered as a service provider.",
      "data": {
        "url": "/service-providers/d8e8467f-acb6-4446-8761-c1f1590763e4",
        "action_id": "d8e8467f-acb6-4446-8761-c1f1590763e4",
        "type": "provider_registration"
      },
      "timestamp": "2025-11-20T13:40:34.567Z",
      "read": false
    },
    {
      "id": 1732105134567,
      "title": "New Provider Registration",
      "body": "Testing Purpose - 002 has successfully registered as a service provider.",
      "data": {
        "url": "/admin/service-providers/26e87b6c-b96d-44d5-91ac-266b070a58c7",
        "action_id": "26e87b6c-b96d-44d5-91ac-266b070a58c7",
        "type": "provider_registration"
      },
      "timestamp": "2025-11-20T13:38:54.567Z",
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
curl "http://localhost:4000/admin/notifications/admin_user_123?page=1&limit=10"

# Get only unread notifications
curl "http://localhost:4000/admin/notifications/admin_user_123?page=1&limit=10&status=unread"

# Get only read notifications
curl "http://localhost:4000/admin/notifications/admin_user_123?page=1&limit=10&status=read"
```

---

### 4. Mark Notification as Read

**POST** `/admin/notifications/mark-read`

Mark a specific notification as read.

#### Request Body

```json
{
  "userId": "admin_user_123",
  "notificationId": 1732105234567
}
```

#### Response

- **200 OK**: `"Updated"`

#### Example

```bash
curl -X POST http://localhost:4000/admin/notifications/mark-read \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin_user_123",
    "notificationId": 1732105234567
  }'
```

---

## Frontend Integration Guide

### 1. Initialize Firebase in Admin Portal

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
      await fetch("http://localhost:4000/admin/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "admin_user_123",
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
  let url = `http://localhost:4000/admin/notifications/admin_user_123?page=${page}&limit=${limit}`;

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
  fetch("http://localhost:4000/admin/notifications/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "admin_user_123",
      notificationId: notification.id,
    }),
  });

  // Redirect to provider details
  window.location.href = notification.data.url;
  // Example: /admin/service-providers/d8e8467f-acb6-4446-8761-c1f1590763e4
}
```

---

## Testing

### 1. Save Admin Token

```bash
node save-admin-token.js YOUR_FCM_TOKEN
```

### 2. Trigger Test Notification

```bash
node test-with-real-token.js
```

This will randomly select one of the 3 provider data sets and send a notification.

---

## Notification Flow

1. **Provider Registration**: When a service provider successfully registers
2. **Backend Trigger**: Your backend calls `/admin/trigger-notification`
3. **FCM Sends**: Firebase sends push notification to admin's device
4. **Admin Receives**: Notification appears in browser/app
5. **Click Handler**: On click, admin is redirected to `/admin/service-providers/:id`
6. **Mark as Read**: Notification is marked as read in the system

---

## Notes

- All URLs now have `/admin` prefix for admin portal
- Notification type is set to `"provider_registration"`
- Redirect URL format: `/admin/service-providers/:providerId`
- Notifications are stored in-memory (will be lost on server restart)
- For production, use a database (MongoDB, PostgreSQL, etc.)
