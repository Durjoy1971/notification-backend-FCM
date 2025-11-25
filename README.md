# Firebase Cloud Messaging Backend Simulator

A Node.js backend server for handling Firebase Cloud Messaging (FCM) notifications. This server manages user FCM tokens and triggers push notifications.

## 🚀 Features

- **Token Management**: Save and manage FCM tokens for users
- **Notification Triggering**: Send push notifications to specific users
- **Mock Database**: In-memory storage for development (replace with real DB in production)
- **CORS Enabled**: Ready to accept requests from frontend applications

## 📋 Prerequisites

- Node.js (v14 or higher)
- Firebase project with Cloud Messaging enabled
- Firebase Admin SDK service account credentials

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase Admin SDK

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `service-account.json` in the project root

⚠️ **IMPORTANT**: Never commit `service-account.json` to version control!

### 3. Start the Server

```bash
node server.js
```

The server will start on `http://localhost:4000`

## 📡 API Endpoints

### 1. Save FCM Token

**Endpoint**: `POST /save-token`

**Description**: Saves a user's FCM token to the database

**Request Body**:
```json
{
  "userId": "user123",
  "token": "fcm_token_here"
}
```

**Response**:
- `200 OK`: "Token saved successfully"
- `400 Bad Request`: "Missing userId or token"

**Example (cURL)**:
```bash
curl -X POST http://localhost:4000/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "token": "your_fcm_token_here"
  }'
```

### 2. Trigger Notification

**Endpoint**: `POST /trigger-notification`

**Description**: Sends a push notification to a specific user

**Request Body**:
```json
{
  "userId": "user123",
  "status": "approved",
  "docId": "DOC-12345"
}
```

**Response**:
- `200 OK`: "Notification sent!"
- `404 Not Found`: "No token found for user {userId}"
- `500 Internal Server Error`: Error message from FCM

**Example (cURL)**:
```bash
curl -X POST http://localhost:4000/trigger-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "status": "approved",
    "docId": "DOC-12345"
  }'
```

**Example (Postman)**:
1. Method: `POST`
2. URL: `http://localhost:4000/trigger-notification`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "userId": "user123",
  "status": "approved",
  "docId": "DOC-12345"
}
```

## 🔄 Notification Message Format

The notification sent includes:

**Notification Payload**:
- `title`: "Document {STATUS}"
- `body`: "Your document #{docId} has been {status}."

**Data Payload**:
- `type`: "document_status"
- `action_id`: Document ID
- `url`: "/documents/{docId}"
- `status`: Document status

## 🧪 Testing Flow

1. **Start the backend server**:
   ```bash
   node server.js
   ```

2. **From your frontend**: Call `/save-token` with a user ID and FCM token

3. **Trigger a test notification**:
   ```bash
   curl -X POST http://localhost:4000/trigger-notification \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user123",
       "status": "approved",
       "docId": "DOC-12345"
     }'
   ```

4. **Check your device/browser** for the notification

## 🗄️ Database Structure (Mock)

Currently using in-memory storage:

```javascript
{
  "user123": "fcm_token_abc...",
  "user456": "fcm_token_xyz..."
}
```

### Production Migration

Replace `userTokens` object with a real database:

**MongoDB Example**:
```javascript
const UserToken = mongoose.model('UserToken', {
  userId: String,
  fcmToken: String,
  createdAt: Date
});
```

**MySQL Example**:
```sql
CREATE TABLE user_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE,
  fcm_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Considerations

- ✅ `service-account.json` is in `.gitignore`
- ⚠️ Add authentication middleware for production
- ⚠️ Implement rate limiting
- ⚠️ Validate and sanitize all inputs
- ⚠️ Use environment variables for sensitive config

## 📝 Next Steps

1. **Add Database**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Add Authentication**: Protect endpoints with JWT or API keys
3. **Add Logging**: Implement proper logging (Winston, Morgan)
4. **Add Validation**: Use express-validator for input validation
5. **Add Rate Limiting**: Prevent abuse with express-rate-limit
6. **Add Error Handling**: Centralized error handling middleware

## 🐛 Troubleshooting

### "No token found for user"
- Ensure the frontend has called `/save-token` first
- Check that the `userId` matches exactly

### "Error sending notification"
- Verify `service-account.json` is valid
- Check Firebase Console for Cloud Messaging status
- Ensure the FCM token is valid and not expired

### CORS errors
- The server has CORS enabled by default
- Adjust CORS settings in `server.js` if needed

## 📚 Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Express.js Documentation](https://expressjs.com/)

## 📄 License

ISC
