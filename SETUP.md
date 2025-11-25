# 🚀 Quick Start Guide

## Step 1: Get Your Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the **gear icon** ⚙️ → **Project Settings**
4. Navigate to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Click **Generate Key** in the confirmation dialog
7. A JSON file will download automatically

## Step 2: Configure the Backend

1. Rename the downloaded file to `service-account.json`
2. Move it to the project root directory:
   ```
   notification-backend/
   ├── service-account.json  ← Put it here
   ├── server.js
   ├── package.json
   └── ...
   ```

## Step 3: Start the Server

```bash
npm start
```

You should see:
```
Backend Server running on http://localhost:4000
```

## Step 4: Test the Server

### Option A: Using the Test Script

1. Get an FCM token from your frontend (see Frontend Integration below)
2. Edit `test-notification.js` and replace `YOUR_FCM_TOKEN_HERE` with the actual token
3. Run:
   ```bash
   node test-notification.js
   ```

### Option B: Using cURL

**Save a token:**
```bash
curl -X POST http://localhost:4000/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "token": "your_fcm_token_here"
  }'
```

**Send a notification:**
```bash
curl -X POST http://localhost:4000/trigger-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "status": "approved",
    "docId": "DOC-12345"
  }'
```

## Frontend Integration

### 1. Install Firebase SDK in your frontend

```bash
npm install firebase
```

### 2. Initialize Firebase in your React app

```javascript
// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

### 3. Request permission and get FCM token

```javascript
// src/components/NotificationSetup.jsx
import { messaging } from '../firebase-config';
import { getToken } from 'firebase/messaging';

async function requestNotificationPermission(userId) {
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console
      });
      
      // Send token to backend
      await fetch('http://localhost:4000/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token })
      });
      
      console.log('✅ Notification permission granted and token saved!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 4. Create firebase-messaging-sw.js in your public folder

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## 🎯 Complete Flow

1. **User visits your app** → Frontend requests notification permission
2. **Permission granted** → Frontend gets FCM token
3. **Frontend calls** `POST /save-token` → Backend saves token
4. **Admin action happens** → Backend calls `POST /trigger-notification`
5. **User receives notification** → On their device/browser

## 🔍 Troubleshooting

### "service-account.json not found"
- Make sure the file is in the project root
- Check the filename is exactly `service-account.json`

### "No token found for user"
- The frontend must call `/save-token` first
- Check the userId matches exactly

### "Permission denied" in browser
- User must grant notification permission
- Check browser settings allow notifications

### CORS errors
- The server has CORS enabled by default
- If issues persist, check your frontend URL

## 📚 Next Steps

- [ ] Add a real database (MongoDB/PostgreSQL)
- [ ] Add authentication to protect endpoints
- [ ] Deploy to production (Heroku, AWS, etc.)
- [ ] Add notification history/logging
- [ ] Support multiple notification types

## 🆘 Need Help?

Check the main [README.md](./README.md) for detailed documentation.
