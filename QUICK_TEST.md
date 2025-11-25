# Quick Test - Verify Admin Endpoints

This script tests all admin endpoints to ensure they're working correctly.

## Test 1: Check Server Health
```bash
curl http://localhost:4000/admin/notifications/admin_user_123
```
Expected: `[]` (empty array)

## Test 2: Save Token (Manual)
```bash
curl -X POST http://localhost:4000/admin/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin_user_123",
    "token": "test_token_123"
  }'
```
Expected: `Saved`

## Test 3: Trigger Notification (Manual - will fail without real FCM token)
```bash
curl -X POST http://localhost:4000/admin/trigger-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin_user_123",
    "providerId": "d8e8467f-acb6-4446-8761-c1f1590763e4",
    "providerName": "Aust"
  }'
```

## Test 4: Using the Test Script
```bash
# First save your real FCM token
node save-admin-token.js YOUR_REAL_FCM_TOKEN

# Then trigger a test notification
node test-with-real-token.js
```

## Test 5: Mark as Read
```bash
curl -X POST http://localhost:4000/admin/notifications/mark-read \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin_user_123",
    "notificationId": 1732105234567
  }'
```
Expected: `Updated`
